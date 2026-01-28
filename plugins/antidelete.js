module.exports = {
  name: "antidelete",
  command: ["antidelete"],
  tags: ["group"],
  group: true,
  admin: false,
  owner: false,
  limit: false,

  usedCmd: [
    "antidelete on",
    "antidelete off"
  ],

  async handler({ m, chatId, args, isAdmin, isOwner }) {
    if (!isAdmin && !isOwner) {
      return m.reply("❌ Command ini hanya untuk *Admin Grup* atau *Owner Bot*")
    }

    global.db.antidelete = global.db.antidelete || {}

    const action = args[0]?.toLowerCase()

    if (!action || !["on", "off"].includes(action)) {
      return m.reply(
        "❌ Format salah\n\n" +
        "Gunakan:\n" +
        "• .antidelete on\n" +
        "• .antidelete off"
      )
    }

    if (action === "on") {
      global.db.antidelete[chatId] = true
      return m.reply("✅ *ANTI-DELETE AKTIF* di grup ini")
    }

    if (action === "off") {
      global.db.antidelete[chatId] = false
      return m.reply("❌ *ANTI-DELETE DIMATIKAN* di grup ini")
    }
  }
}