const { downloadMediaMessage } = require("@whiskeysockets/baileys")

module.exports = {
  name: "setbot",
  command: ["setbot"],
  owner: true,
  tags: ["owner"],

  async handler({ sock, m, args }) {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ""
    const type = (args[0] || "").toLowerCase()

    if (!type) {
      return m.reply(
        "⚙️ *SETBOT MENU*\n\n" +
        "• setbot pp (reply gambar)\n" +
        "• setbot name <nama bot>\n" +
        "• setbot bio <bio bot>\n" +
        "• setbot status <teks>\n\n" +
        "Contoh:\n" +
        "setbot name LYDIA AI"
      )
    }

    if (type === "pp") {
      if (!m.quoted) {
        return m.reply("❌ Reply gambar untuk dijadikan foto profil bot")
      }

      if (!/image\/(jpe?g|png)/i.test(mime)) {
        return m.reply("❌ File yang direply harus berupa gambar")
      }

      const buffer = await downloadMediaMessage(
        q,
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage }
      )

      await sock.updateProfilePicture(sock.user.id, buffer)

      return m.reply("✅ Foto profil bot berhasil diubah")
    }

    if (type === "name") {
      const name = args.slice(1).join(" ")
      if (!name) return m.reply("❌ Masukkan nama bot")

      await sock.updateProfileName(name)
      return m.reply(`✅ Nama bot diubah menjadi:\n${name}`)
    }

    if (type === "bio") {
      const bio = args.slice(1).join(" ")
      if (!bio) return m.reply("❌ Masukkan bio bot")

      await sock.updateProfileStatus(bio)
      return m.reply("✅ Bio bot berhasil diubah")
    }

    if (type === "status") {
      const text = args.slice(1).join(" ")
      if (!text) return m.reply("❌ Masukkan teks status")

      await sock.sendMessage("status@broadcast", { text })
      return m.reply("✅ Status WhatsApp bot berhasil diupdate")
    }

    return m.reply("❌ Perintah tidak dikenali\nKetik: setbot")
  }
}
