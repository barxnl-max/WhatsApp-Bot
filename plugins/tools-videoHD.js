const axios = require("axios")
const videoHD = require("../lib/scraper/videoHD")
const { downloadMediaMessage } = require("@whiskeysockets/baileys")

module.exports = {
  name: "videohd",
  command: ["videohd", "vhd"],
  tags: ["tools"],
  limit: true,
  premium: true,

  async handler({ sock, m }) {
    if (!m.quoted) {
      return m.reply("❌ Reply video yang mau di-HD")
    }

    if (!/video/.test(m.quoted.mtype || "")) {
      return m.reply("❌ Hanya bisa untuk video")
    }

    try {
      await m.reply("🎬 Memproses video...\n⏳ Tunggu 1-3 menit")

      const buffer = await downloadMediaMessage(
        m.quoted,
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage }
      )

      const result = await videoHD(buffer)

      if (!result.success) {
        return m.reply("❌ " + result.message)
      }

      const url = result.result.url

      // 🔥 Download hasil dulu
      const videoRes = await axios.get(url, {
        responseType: "arraybuffer"
      })

      const sizeMB = videoRes.data.length / 1024 / 1024

      if (sizeMB > 90) {
        return m.reply(
          `✅ Video berhasil di-HD\n\n` +
          `📦 Size: ${sizeMB.toFixed(2)} MB (terlalu besar)\n\n` +
          `🔗 Download manual:\n${url}`
        )
      }

      await sock.sendMessage(
        m.chat,
        {
          video: Buffer.from(videoRes.data),
          caption: "✅ Video berhasil di-HD"
        },
        { quoted: m }
      )

    } catch (err) {
      console.error(err)
      m.reply("❌ Gagal mengirim video HD")
    }
  }
}
