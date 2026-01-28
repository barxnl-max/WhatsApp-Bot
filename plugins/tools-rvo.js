const { downloadContentFromMessage } = require("@whiskeysockets/baileys")

module.exports = {
  name: "rvo",
  command: ["rvo", "readvo", "viewonce"],
  usedCmd: "rvo",
  tags: ["tools"],
  limit: true,

  async handler({ sock, m, chatId }) {
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted) return m.reply("❌ Reply view-once image, video, atau audio")

    const image = quoted.imageMessage
    const video = quoted.videoMessage
    const audio = quoted.audioMessage

    if (image?.viewOnce) {
      const stream = await downloadContentFromMessage(image, "image")
      let buffer = Buffer.from([])
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

      return sock.sendMessage(
        chatId,
        {
          image: buffer,
          caption: image.caption || ""
        },
        { quoted: m }
      )
    }

    if (video?.viewOnce) {
      const stream = await downloadContentFromMessage(video, "video")
      let buffer = Buffer.from([])
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

      return sock.sendMessage(
        chatId,
        {
          video: buffer,
          caption: video.caption || ""
        },
        { quoted: m }
      )
    }

    if (audio?.viewOnce) {
      const stream = await downloadContentFromMessage(audio, "audio")
      let buffer = Buffer.from([])
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

      return sock.sendMessage(
        chatId,
        {
          audio: buffer,
          mimetype: audio.mimetype || "audio/ogg; codecs=opus",
          ptt: audio.ptt || false
        },
        { quoted: m }
      )
    }

    return m.reply("❌ Itu bukan view-once media")
  }
}