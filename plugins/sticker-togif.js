const { webp2mp4 } = require("../lib/webp2mp4")

module.exports = {
  name: "togif",
  command: ["togif"],
  tags: ["tools"],
  limit: true,

  async handler({ sock, m }) {

    const quoted = m.quoted || m

    if (!quoted.msg || quoted.mtype !== "stickerMessage") {
      return m.reply("❌ Reply stiker yang mau dijadikan GIF")
    }

    try {
      const buffer = await quoted.download()

      if (!buffer) return m.reply("❌ Gagal download sticker")

      const url = await webp2mp4(buffer)

      await sock.sendMessage(
        m.chat,
        {
          video: { url },
          gifPlayback: true,
          caption: "✅ Berhasil convert ke GIF"
        },
        { quoted: m }
      )

    } catch (err) {
      console.log("TOGIF ERROR:", err)
      m.reply("❌ Gagal convert stiker\n\n" + err)
    }
  }
}
