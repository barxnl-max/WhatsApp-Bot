const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const Canvacord = require("canvacord")
const fs = require("fs")
const { writeExifImg } = require("../lib/exif")
const settings = require("../settings")

module.exports = {
  name: "triggered",
  command: ["triggered"],
  usedCmd: ["triggered <reply media>"],
  tags: ["sticker"],
  limit: true,

  async handler({ sock, m, chatId }) {
    try {
      const ctx =
        m.message?.extendedTextMessage?.contextInfo ||
        m.message?.imageMessage?.contextInfo ||
        null

      const quoted = ctx?.quotedMessage
      if (!quoted || (!quoted.imageMessage && !quoted.stickerMessage)) {
        return m.reply("⚠️ Reply foto atau stiker (non gif)")
      }

      let stream
      if (quoted.imageMessage) {
        stream = await downloadContentFromMessage(
          quoted.imageMessage,
          "image"
        )
      } else if (quoted.stickerMessage) {
        stream = await downloadContentFromMessage(
          quoted.stickerMessage,
          "sticker"
        )
      }

      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      const result = await Canvacord.Canvas.trigger(buffer)

      const webpPath = await writeExifImg(result, {
        packname: settings.packname,
        author: settings.author
      })

      const sticker = fs.readFileSync(webpPath)
      fs.unlinkSync(webpPath)

      await sock.sendMessage(
        chatId,
        { sticker },
        { quoted: m }
      )
    } catch (err) {
      console.error("TRIGGERED ERROR:", err)
      m.reply("❌ Gagal bikin stiker triggered")
    }
  }
}