module.exports = {
  name: "join",
  command: ["join"],
  tags: ["owner"],
  owner: true,

  async handler({ sock, m, args }) {
    let link = args[0]

    if (!link && m.quoted?.text) {
      link = m.quoted.text
    }

    if (!link) {
      return m.reply("❌ Kirim link grup WhatsApp\n\nContoh:\n.join https://chat.whatsapp.com/xxxxx")
    }

    const match = link.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/i)
    if (!match) {
      return m.reply("❌ Link grup tidak valid")
    }

    const code = match[1]

    try {
      await sock.groupAcceptInvite(code)
      return m.reply("✅ Berhasil join grup")
    } catch (err) {
      const msg = err?.message || ""

      if (
        msg.includes("not-authorized") ||
        msg.includes("approval") ||
        msg.includes("403")
      ) {
        return m.reply(
          "⏳ *Permintaan join terkirim*\n\n" +
          "Grup ini memakai *persetujuan admin*.\n" +
          "⛔ Bot tidak bisa masuk otomatis.\n\n" +
          "✅ Minta admin grup untuk menyetujui."
        )
      }

      console.error("JOIN ERROR:", err)
      m.reply("❌ Gagal join grup\n\nKemungkinan:\n• Bot sudah di grup\n• Link kadaluarsa\n• Bot diblokir")
    }
  }
}