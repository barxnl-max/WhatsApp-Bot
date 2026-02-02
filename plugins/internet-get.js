const fetch = require("node-fetch")
const FileType = require("file-type")

module.exports = {
  name: "get",
  command: ["get", "fetch"],
  tags: ["internet"],
  usedCmd: ["get <url>"],

  async handler({ m, sock, chatId, args }) {
    const url = args.join(" ")
    if (!url) return m.reply("❌ Masukkan URL")
    if (!/^https?:\/\//i.test(url))
      return m.reply("❌ URL harus http/https")

    const res = await fetch(url)
    const buf = await res.buffer()

    const type = await FileType.fromBuffer(buf)

    if (!type && buf.length < 80536) {
      return m.reply(buf.toString())
    }

    if (!type) {
      return sock.sendMessage(
        chatId,
        {
          document: buf,
          fileName: "file.bin",
          mimetype: "application/octet-stream"
        },
        { quoted: m }
      )
    }

    const { mime, ext } = type

    if (mime.startsWith("video/")) {
      return sock.sendMessage(
        chatId,
        { video: buf, mimetype: mime },
        { quoted: m }
      )
    }

    if (mime.startsWith("audio/")) {
      return sock.sendMessage(
        chatId,
        { audio: buf, mimetype: mime },
        { quoted: m }
      )
    }

    if (mime.startsWith("image/")) {
      return sock.sendMessage(
        chatId,
        { image: buf },
        { quoted: m }
      )
    }

    return sock.sendMessage(
      chatId,
      {
        document: buf,
        fileName: `file.${ext}`,
        mimetype: mime
      },
      { quoted: m }
    )
  }
}
