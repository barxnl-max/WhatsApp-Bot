const { downloadMediaMessage } = require("@whiskeysockets/baileys")
const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")

module.exports = {
  name: "toimg",
  command: ["toimg", "toimage"],
  tags: ["tools"],
  limit: true,

  async handler({ sock, m }) {
    if (!m.quoted) {
      return m.reply("❌ Reply sticker yang mau dijadikan gambar")
    }

    if (!/sticker/.test(m.quoted.mtype || "")) {
      return m.reply("❌ Itu bukan sticker")
    }

    try {
      await m.reply("⏳ Mengubah sticker ke gambar...")

      const buffer = await downloadMediaMessage(
        m.quoted,
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage }
      )

      const inputPath = path.join(__dirname, "../temp", Date.now() + ".webp")
      const outputPath = inputPath.replace(".webp", ".png")

      fs.writeFileSync(inputPath, buffer)

      exec(
        `ffmpeg -i "${inputPath}" "${outputPath}"`,
        async (err) => {
          fs.unlinkSync(inputPath)

          if (err) {
            console.error(err)
            return m.reply("❌ Gagal convert sticker")
          }

          const img = fs.readFileSync(outputPath)

          await sock.sendMessage(
            m.chat,
            {
              image: img,
              caption: "✅ Berhasil convert ke gambar"
            },
            { quoted: m }
          )

          fs.unlinkSync(outputPath)
        }
      )

    } catch (err) {
      console.error(err)
      m.reply("❌ Terjadi kesalahan")
    }
  }
}
