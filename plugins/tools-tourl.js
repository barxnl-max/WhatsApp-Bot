const fs = require("fs")
const path = require("path")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const {
  TelegraPh,
  UploadFileUgu,
  UploadFileCatbox
} = require("../lib/uploader")

async function getMedia(message) {
  const msg = message.message || {}

  const types = [
    { key: "imageMessage", type: "image", ext: ".jpg" },
    { key: "videoMessage", type: "video", ext: ".mp4" },
    { key: "audioMessage", type: "audio", ext: ".mp3" },
    { key: "stickerMessage", type: "sticker", ext: ".webp" },
    { key: "documentMessage", type: "document", ext: null }
  ]

  for (const t of types) {
    if (msg[t.key]) {
      const stream = await downloadContentFromMessage(msg[t.key], t.type)
      const chunks = []
      for await (const c of stream) chunks.push(c)

      let ext = t.ext
      if (t.key === "documentMessage") {
        ext = path.extname(msg[t.key].fileName || "") || ".bin"
      }

      return { buffer: Buffer.concat(chunks), ext }
    }
  }

  const quoted = msg.extendedTextMessage?.contextInfo?.quotedMessage
  if (quoted) return getMedia({ message: quoted })

  return null
}

module.exports = {
  name: "tourl",
  command: ["tourl", "url"],
  usedCmd: [
    "tourl",
    "tourl telegra",
    "tourl catbox",
    "tourl uguu"
  ],
  tags: ["tools"],
  limit: true,

  async handler({ sock, m, chatId, args }) {
    const media = await getMedia(m)
    if (!media) {
      return m.reply(
        "❌ Kirim atau reply media\n\n" +
        "Support:\n" +
        "• Image\n" +
        "• Video\n" +
        "• Audio\n" +
        "• Sticker\n" +
        "• Document"
      )
    }

    const tempDir = path.join(process.cwd(), "temp")
    if (!fs.existsSync(tempDir))
      fs.mkdirSync(tempDir, { recursive: true })

    const filePath = path.join(
      tempDir,
      `${Date.now()}${media.ext}`
    )
    fs.writeFileSync(filePath, media.buffer)

    let url = ""
    const mode = (args[0] || "").toLowerCase()

    try {
      if (mode === "telegra") {
        url = await TelegraPh(filePath)
      } else if (mode === "uguu") {
        url = await UploadFileUgu(filePath)
      } else if (mode === "catbox") {
        url = await UploadFileCatbox(filePath)
      } else {
        if ([".jpg", ".jpeg", ".png", ".webp"].includes(media.ext)) {
          try {
            url = await TelegraPh(filePath)
          } catch {
            url = await UploadFileCatbox(filePath)
          }
        } else {
          url = await UploadFileCatbox(filePath)
        }
      }
    } catch (e) {
      console.error("TOURL ERROR:", e)
    }

    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch {}

    if (!url) return m.reply("❌ Gagal upload media")

    await sock.sendMessage(
      chatId,
      {
        text:
          "🔗 *MEDIA URL*\n\n" +
          url
      },
      { quoted: m }
    )
  }
}
