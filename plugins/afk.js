const { getUser } = require("../lib/dbuser")

function formatTime(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h) return `${h} jam ${m % 60} menit`
  if (m) return `${m} menit`
  return `${s} detik`
}

module.exports = {
  name: "afk",
  command: ["afk"],
  usedCmd: ["afk <alasan>"],
  tags: ["tools"],
  group: true,

  async handler({ m, senderId, args }) {
    const user = getUser(senderId)
    const reason = args.join(" ") || "AFK"

    user.afk = {
      reason,
      since: Date.now()
    }

    await m.reply(
      `💤 Kamu sekarang AFK\n` +
      `📝 Alasan: ${reason}`
    )
  },

  async responder({ sock, m }) {
    const senderId = m.sender
    const chatId = m.chat
    const sender = getUser(senderId)

    const text =
      m.text ||
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      ""

    const isMention =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length

    const isReply =
      m.message?.extendedTextMessage?.contextInfo?.participant

    if (sender.afk && text && !isMention && !isReply) {
      const durasi = formatTime(Date.now() - sender.afk.since)
      const reason = sender.afk.reason

      sender.afk = null

      await sock.sendMessage(
        chatId,
        {
          text:
            `👋 Selamat datang kembali\n` +
            `⏱ AFK selama: ${durasi}\n` +
            `📝 Alasan: ${reason}`
        },
        { quoted: m }
      )

      return false
    }

    if (!m.isGroup) return false

    const mentioned =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    const quoted =
      m.message?.extendedTextMessage?.contextInfo?.participant

    const targets = new Set([
      ...mentioned,
      ...(quoted ? [quoted] : [])
    ])

    for (const jid of targets) {
      const target = getUser(jid)
      if (!target?.afk) continue

      const durasi = formatTime(Date.now() - target.afk.since)

      await sock.sendMessage(
        chatId,
        {
          text:
            `💤 User sedang AFK\n\n` +
            `👤 @${jid.split("@")[0]}\n` +
            `📝 Alasan: ${target.afk.reason}\n` +
            `⏱ Sejak: ${durasi} lalu`,
          mentions: [jid]
        },
        { quoted: m }
      )

      return true
    }

    return false
  }
}