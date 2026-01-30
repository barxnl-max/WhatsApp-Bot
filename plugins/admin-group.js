const { downloadMediaMessage } = require("@whiskeysockets/baileys")

module.exports = {
  name: "group",
  command: ["group"],
  usedCmd: [
    "group name <nama>",
    "group desc <deskripsi>",
    "group open",
    "group close",
    "group pp (reply gambar)",
    "group link",
    "group revoke"
  ],
  tags: ["admin"],
  group: true,
  admin: true,
  botAdmin: true,

  async handler({
    sock,
    m,
    chatId,
    args,
    isAdmin,
    isBotAdmin
  }) {
    if (!isBotAdmin) return m.reply("❌ Bot harus jadi admin")
    if (!isAdmin) return m.reply("❌ Hanya admin grup")

    const sub = (args[0] || "").toLowerCase()

    if (!sub) {
      return m.reply(
        "⚙️ *GROUP MANAGER*\n\n" +
        "• group name <nama>\n" +
        "• group desc <deskripsi>\n" +
        "• group open\n" +
        "• group close\n" +
        "• group pp (reply gambar)\n" +
        "• group link\n" +
        "• group revoke"
      )
    }

    if (sub === "open") {
      await sock.groupSettingUpdate(chatId, "not_announcement")
      return m.reply("🔓 Grup dibuka")
    }

    if (sub === "close") {
      await sock.groupSettingUpdate(chatId, "announcement")
      return m.reply("🔒 Grup ditutup")
    }

    if (sub === "name") {
      const name = args.slice(1).join(" ")
      if (!name) return m.reply("❌ Nama grup tidak boleh kosong")

      await sock.groupUpdateSubject(chatId, name)
      return m.reply("✅ Nama grup berhasil diubah")
    }

    if (sub === "desc") {
      const desc = args.slice(1).join(" ")
      if (!desc) return m.reply("❌ Deskripsi tidak boleh kosong")

      await sock.groupUpdateDescription(chatId, desc)
      return m.reply("✅ Deskripsi grup berhasil diubah")
    }

    if (sub === "pp") {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const img =
        quoted?.imageMessage ||
        m.message?.imageMessage

      if (!img) {
        return m.reply("❌ Reply / kirim gambar untuk foto grup")
      }

      const buffer = await downloadMediaMessage(
        {
          key: m.key,
          message: quoted ? { imageMessage: img } : m.message
        },
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage }
      )

      await sock.updateProfilePicture(chatId, buffer)
      return m.reply("✅ Foto grup berhasil diubah")
    }

    if (sub === "link") {
      const code = await sock.groupInviteCode(chatId)
      return m.reply(
        "🔗 *LINK GRUP*\n\n" +
        `https://chat.whatsapp.com/${code}`
      )
    }

    if (sub === "revoke") {
      await sock.groupRevokeInvite(chatId)
      const code = await sock.groupInviteCode(chatId)

      return m.reply(
        "♻️ *LINK GRUP DIPERBARUI*\n\n" +
        `https://chat.whatsapp.com/${code}`
      )
    }

    return m.reply("❌ Perintah tidak dikenal")
  }
}
