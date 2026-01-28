const Completion = require("../lib/chatai")
const yts = require("yt-search")
const ytmp3 = require("../lib/ytmp3")
const isAdmin = require("../lib/isAdmin")
const convert = require("../lib/convert")
const createTranscription = require("../lib/whisper")
const { downloadMediaMessage } = require("@whiskeysockets/baileys")

if (!global.REPLY_SESSIONS) global.REPLY_SESSIONS = new Map()
if (!global.CHATGPT_STATUS) global.CHATGPT_STATUS = { enabled: false }

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
    plugin: "chatgpt",
    msgId: sent.key.id,
    expire: Date.now() + 10 * 60 * 1000
  })
}

async function handleFunction({ sock, m, call }) {
  const { name, arguments: data } = call

  if (name === "downloadMusic") {
    const title = data?.title
    if (!title) return m.reply("🎧 Judul lagunya apa?")

    await m.reply(`🎶 Cari *${title}* dulu yaa~`)
    const search = await yts(title)
    const video = search.videos.find(v => v.seconds < 600)
    if (!video) return m.reply("😭 Lagunya gak ketemu")

    const dl = await ytmp3(video.url)
    if (!dl?.status) return m.reply("❌ Gagal download lagu")

    await sock.sendMessage(
      m.chat,
      {
        audio: await convert.toPTT(dl.buffer),
        mimetype: "audio/ogg; codecs=opus",
        ptt: false,
        fileName: video.title + ".mp3"
      },
      { quoted: m }
    )
  }

  if (name === "close_group" || name === "open_group") {
    if (!m.isGroup) return m.reply("❌ Ini cuma bisa di grup")

    const admin = await isAdmin(sock, m.chat, m.sender)
    if (!admin.isBotAdmin) return m.reply("❌ Bot belum admin")
    if (!admin.isSenderAdmin) return m.reply("❌ Cuma admin grup")

    if (name === "close_group") {
      await sock.groupSettingUpdate(m.chat, "announcement")
      m.reply("🔒 Grup ditutup")
    } else {
      await sock.groupSettingUpdate(m.chat, "not_announcement")
      m.reply("🔓 Grup dibuka")
    }
  }
}

module.exports = {
  name: "chatgpt",
  command: ["chatgpt"],
  tags: ["ai"],
  owner: true,

  async handler({ m, args, isOwner }) {
    if (!isOwner) return m.reply("❌ Owner only")

    const mode = args[0]

    if (mode === "on") {
      global.CHATGPT_STATUS.enabled = true

      const sent = await m.reply(
        "🤖 *ChatGPT siap digunakan*\n\n" +
        "Silakan reply pesan ini untuk mulai chat"
      )

      saveReply(m, sent)
      return
    }

    if (mode === "off") {
      global.CHATGPT_STATUS.enabled = false
      resetAI(m.sender)
      global.REPLY_SESSIONS.delete(m.sender)
      return m.reply("⛔ ChatGPT dimatikan")
    }

    m.reply("❓ Gunakan:\n.chatgpt on\n.chatgpt off")
  },

  async onReply({ sock, m, session, isOwner }) {
    if (!isOwner) return
    if (!global.CHATGPT_STATUS.enabled) return
    if (!session || session.plugin !== "chatgpt") return

    if (Date.now() > session.expire) {
      global.REPLY_SESSIONS.delete(m.sender)
      return m.reply("⏳ Sesi ChatGPT habis")
    }

    const input = await getInput(sock, m)
    if (!input) return

    if (input.toLowerCase() === "reset") {
      resetAI(m.sender)
      return m.reply("♻️ ChatGPT direset")
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