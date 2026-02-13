const imageHD = require("../lib/scraper/imageHD")
const { downloadMediaMessage } = require("@whiskeysockets/baileys")

module.exports = {
  name: "imagehd",
  command: ["hdr", "enhance", "upscale"],
  tags: ["tools"],
  limit: true,

  async handler({ sock, m, args }) {
    if (!m.quoted) {
      return m.reply("❌ Reply gambar yang mau di-HD")
    }

    const mime = m.quoted.mtype || m.quoted.type

    if (!/image/.test(mime)) {
      return m.reply("❌ Hanya bisa untuk gambar")
    }

    let scale = parseInt(args[0])
    if (![2, 4].includes(scale)) scale = 4

    try {
      await m.reply("🔄 Memproses gambar ke HD...")

      const buffer = await downloadMediaMessage(
        m.quoted,
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage }
      )

      const result = await imageHD(buffer, scale)

      if (!result.success) {
        return m.reply("❌ Gagal upscale gambar")
      }

      await sock.sendMessage(
        m.chat,
        {
          image: result.buffer,
          caption: `✅ Berhasil upscale ${scale}x`
        },
        { quoted: m }
      )

    } catch (err) {
      console.error(err)
      m.reply("❌ Terjadi error saat proses HD")
    }
  }
}
