const axios = require("axios")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const { uploadImage } = require("../lib/uploadImage")

async function getAvatarUrl(sock, m) {
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (quoted?.imageMessage) {
    const stream = await downloadContentFromMessage(quoted.imageMessage, "image")
    const chunks = []
    for await (const c of stream) chunks.push(c)
    return await uploadImage(Buffer.concat(chunks))
  }

  if (m.message?.imageMessage) {
    const stream = await downloadContentFromMessage(m.message.imageMessage, "image")
    const chunks = []
    for await (const c of stream) chunks.push(c)
    return await uploadImage(Buffer.concat(chunks))
  }

  const ctx = m.message?.extendedTextMessage?.contextInfo
  const jid =
    ctx?.mentionedJid?.[0] ||
    ctx?.participant ||
    m.sender

  try {
    return await sock.profilePictureUrl(jid, "image")
  } catch {
    return "https://i.imgur.com/2wzGhpF.png"
  }
}

async function sendImage(sock, chatId, url, m) {
  const res = await axios.get(url, { responseType: "arraybuffer" })
  await sock.sendMessage(
    chatId,
    { image: Buffer.from(res.data) },
    { quoted: m }
  )
}

module.exports = {
  name: "misc",
  command: ["canvas"],
  tags: ["fun"],
  limit: true,

  async handler({ sock, m, chatId, args, prefix }) {
    const sub = (args[0] || "").toLowerCase()
    const rest = args.slice(1).join(" ")

    if (!sub) {
      return m.reply(
`🎨 *MISC CANVAS MENU*

📌 *Avatar Effect*
• heart
• horny
• circle
• lgbt
• lied
• lolice
• simpcard
• tonikawa

📌 *Overlay*
• triggered
• jail
• gay
• glass
• passed
• comrade

📌 *Text Based*
• its-so-stupid <text>
• oogway <quote>
• oogway2 <quote>

📌 *Fake Social*
• tweet name|user|text|theme?
• youtube-comment user|comment
• namecard name|birthday|desc?

📝 Contoh:
${prefix}canvas heart
${prefix}canvas tweet Barxnl|barxnl|Halo dunia|dark
${prefix}canvas its-so-stupid kok bisa

📸 Bisa reply / mention / kirim foto`
      )
    }

    const avatar = await getAvatarUrl(sock, m)

    const avatarOnly = [
      "heart","horny","circle","lgbt","lied",
      "lolice","simpcard","tonikawa"
    ]

    const overlay = [
      "triggered","jail","gay","glass","passed","comrade"
    ]

    try {
      if (avatarOnly.includes(sub)) {
        return await sendImage(
          sock,
          chatId,
          `https://api.some-random-api.com/canvas/misc/${sub}?avatar=${encodeURIComponent(avatar)}`,
          m
        )
      }

      if (overlay.includes(sub)) {
        return await sendImage(
          sock,
          chatId,
          `https://api.some-random-api.com/canvas/overlay/${sub}?avatar=${encodeURIComponent(avatar)}`,
          m
        )
      }

      if (sub === "its-so-stupid") {
        if (!rest) return m.reply("❌ Masukkan teks")
        return await sendImage(
          sock,
          chatId,
          `https://api.some-random-api.com/canvas/misc/its-so-stupid?dog=${encodeURIComponent(rest)}&avatar=${encodeURIComponent(avatar)}`,
          m
        )
      }

      if (sub === "oogway" || sub === "oogway2") {
        if (!rest) return m.reply("❌ Masukkan quote")
        return await sendImage(
          sock,
          chatId,
          `https://api.some-random-api.com/canvas/misc/${sub}?quote=${encodeURIComponent(rest)}&avatar=${encodeURIComponent(avatar)}`,
          m
        )
      }

      if (sub === "tweet") {
        const [name, user, text, theme] = rest.split("|").map(v => v?.trim())
        if (!name || !user || !text)
          return m.reply("❌ Format: name|user|text|theme?")
        const q = new URLSearchParams({
          displayname: name,
          username: user,
          comment: text,
          avatar
        })
        if (theme) q.append("theme", theme)
        return await sendImage(
          sock,
          chatId,
          `https://api.some-random-api.com/canvas/misc/tweet?${q}`,
          m
        )
      }

      if (sub === "youtube-comment") {
        const [user, text] = rest.split("|").map(v => v?.trim())
        if (!user || !text)
          return m.reply("❌ Format: user|comment")
        return await sendImage(
          sock,
          chatId,
          `https://api.some-random-api.com/canvas/misc/youtube-comment?username=${encodeURIComponent(user)}&comment=${encodeURIComponent(text)}&avatar=${encodeURIComponent(avatar)}`,
          m
        )
      }

      if (sub === "namecard") {
        const [name, birth, desc] = rest.split("|").map(v => v?.trim())
        if (!name || !birth)
          return m.reply("❌ Format: name|birthday|desc?")
        const q = new URLSearchParams({
          username: name,
          birthday: birth,
          avatar
        })
        if (desc) q.append("description", desc)
        return await sendImage(
          sock,
          chatId,
          `https://api.some-random-api.com/canvas/misc/namecard?${q}`,
          m
        )
      }

      m.reply("❌ Subcommand tidak dikenal\nKetik .canvas untuk lihat menu")
    } catch (e) {
      console.error("MISC ERROR:", e)
      m.reply("❌ Gagal generate gambar")
    }
  }
}
