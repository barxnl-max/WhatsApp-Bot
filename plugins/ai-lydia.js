const Completion = require("../lib/chatgroq")
const yts = require("yt-search")
const ytmp3 = require("../lib/ytmp3")
const isAdmin = require("../lib/isAdmin")
const convert = require("../lib/convert")
const createTranscription = require("../lib/whisper")
const { downloadMediaMessage } = require("@whiskeysockets/baileys")

const sessions = new Map()

const getAI = sender => {
  let ai = sessions.get(sender)
  if (!ai) {
    ai = new Completion(sender)
    sessions.set(sender, ai)
  }
  return ai
}

const resetAI = sender => sessions.delete(sender)

const getInput = async (sock, m) => {
  if (m.text && m.text.trim()) return m.text.trim()

  const msg = m.message
  const media = msg?.audioMessage || msg?.videoMessage || msg?.imageMessage
  if (!media) return null

  const buffer = await downloadMediaMessage(
    { key: m.key, message: msg },
    "buffer",
    {},
    { reuploadRequest: sock.updateMediaMessage }
  )

  const transcript = await createTranscription(buffer)
  return transcript?.text?.trim() || null
}

const saveReply = (m, sent) => {
  global.REPLY_SESSIONS.set(m.sender, {
    plugin: "lydia",
    msgId: sent.key.id,
    expire: Date.now() + 10 * 60 * 1000
  })
}

async function handleFunction({ sock, m, call }) {
  const { name, arguments: data } = call

  if (name === "downloadMusic") {
    const title = data?.title
    if (!title) return m.reply("🎧 Judul lagunya apa?")

    await m.reply(`🎶 Cari *${title}* dulu ya~`)
    const search = await yts(title)
    const video = search.videos.find(v => v.seconds < 600)
    if (!video) return m.reply("😭 Lagunya gak ketemu")

    const dl = await ytmp3(video.url)
    if (!dl?.status) return m.reply("❌ Gagal download lagu")

    const sent = await sock.sendMessage(
      m.chat,
      {
        audio: await convert.toPTT(dl.buffer),
        mimetype: "audio/ogg; codecs=opus",
        ptt: false,
        fileName: video.title + ".mp3"
      },
      { quoted: m }
    )

    saveReply(m, sent)
    return
  }

  if (name === "close_group" || name === "open_group") {
    if (!m.isGroup) return m.reply("❌ Ini cuma bisa di grup")

    const admin = await isAdmin(sock, m.chat, m.sender)
    if (!admin.isBotAdmin) return m.reply("❌ Bot belum admin")
    if (!admin.isSenderAdmin) return m.reply("❌ Cuma admin grup")

    await sock.groupSettingUpdate(
      m.chat,
      name === "close_group" ? "announcement" : "not_announcement"
    )

    const sent = await m.reply(
      name === "close_group" ? "🔒 Grup ditutup" : "🔓 Grup dibuka"
    )

    saveReply(m, sent)
  }
}

module.exports = {
  name: "lydia",
  command: ["lydia"],
  tags: ["ai"],
  owner: true,

  async handler({ m, isOwner }) {
  if (!isOwner) return m.reply("❌ Lydia hanya untuk owner")

  return m.reply(
    "💙 *Lydia AI*\n\n" +
    "Gunakan langsung tanpa prefix:\n" +
    "• lydia\n" +
    "• lydia halo\n\n" +
    "Reset:\n" +
    "• lydia reset"
  )
},
  async responder({ sock, m, isOwner }) {
    if (!isOwner) return false

    const input = await getInput(sock, m)
    if (!input) return false

    const first = input.toLowerCase().split(/\s+/)[0]
    if (first !== "lydia") return false

    if (input.toLowerCase() === "lydia reset") {
      resetAI(m.sender)
      return m.reply("💔 Ingatan Lydia direset")
    }

    const ai = getAI(m.sender)
    await sock.sendPresenceUpdate("composing", m.chat)

    const res = await ai.chat(input)

    if (res?.function_call) {
      await handleFunction({ sock, m, call: res.function_call })
      return true
    }

    if (!res?.content) return false

    const sent = await m.reply(res.content)
    saveReply(m, sent)
    return true
  },

  async onReply({ sock, m, isOwner }) {
    if (!isOwner) return

    const input = await getInput(sock, m)
    if (!input) return

    if (input.toLowerCase() === "reset") {
      resetAI(m.sender)
      return m.reply("💔 Ingatan Lydia direset")
    }

    const ai = getAI(m.sender)
    await sock.sendPresenceUpdate("composing", m.chat)

    const res = await ai.chat(input)

    if (res?.function_call) {
      await handleFunction({ sock, m, call: res.function_call })
      return
    }

    if (!res?.content) return

    const sent = await m.reply(res.content)
    saveReply(m, sent)
  }
}