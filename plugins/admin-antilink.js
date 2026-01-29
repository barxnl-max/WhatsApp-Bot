const { getGroup } = require("../lib/dbgroup")

function hasLink(text = "") {
  return /(https?:\/\/|chat\.whatsapp\.com\/)/i.test(text)
}

module.exports = {
  name: "antilink",
  command: ["antilink"],
  usedCmd: [
    "antilink on",
    "antilink off",
    "antilink kick on",
    "antilink kick off"
  ],
  tags: ["admin"],
  group: true,
  admin: true,
  botAdmin: true,
  limit: false,

  async handler({ m, chatId, args, isAdmin, isOwner, isBotAdmin }) {
    if (!isAdmin && !isOwner) return m.reply("❌ Admin only")
    if (!isBotAdmin) return m.reply("❌ Bot harus admin")

    const group = getGroup(chatId)

    if (!group.settings) group.settings = {}
    if (!group.settings.antilink) {
      group.settings.antilink = {
        enabled: false,
        kick: false
      }
    }

    const cmd = (args[0] || "").toLowerCase()
    const opt = (args[1] || "").toLowerCase()

    if (!cmd) {
      return m.reply(
        `🛡️ *ANTILINK*\n\n` +
        `Status : ${group.settings.antilink.enabled ? "ON" : "OFF"}\n` +
        `Kick   : ${group.settings.antilink.kick ? "ON" : "OFF"}\n\n` +
        `Gunakan:\n` +
        `.antilink on\n` +
        `.antilink off\n` +
        `.antilink kick on\n` +
        `.antilink kick off`
      )
    }

    if (cmd === "on") {
      group.settings.antilink.enabled = true
      return m.reply("✅ Antilink diaktifkan")
    }

    if (cmd === "off") {
      group.settings.antilink.enabled = false
      return m.reply("❌ Antilink dimatikan")
    }

    if (cmd === "kick") {
      if (!["on", "off"].includes(opt)) {
        return m.reply("❌ Gunakan: antilink kick on/off")
      }

      group.settings.antilink.kick = opt === "on"
      return m.reply(
        opt === "on"
          ? "⚠️ Antilink kick diaktifkan"
          : "ℹ️ Antilink kick dimatikan"
      )
    }

    m.reply("❌ Perintah tidak dikenal")
  },

  async responder({ sock, m, isOwner }) {
    if (!m.isGroup) return false
    if (isOwner) return false

    const group = getGroup(m.chat)
    const cfg = group.settings?.antilink

    if (!cfg || !cfg.enabled) return false

    const text =
      m.text ||
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      ""

    if (!hasLink(text)) return false

    const meta = await sock.groupMetadata(m.chat)
    const admins = meta.participants
      .filter(p => p.admin)
      .map(p => p.id)

    if (admins.includes(m.sender)) return false

    await sock.sendMessage(m.chat, { delete: m.key })

    if (cfg.kick) {
      await sock.groupParticipantsUpdate(
        m.chat,
        [m.sender],
        "remove"
      )
    }

    return true
  }
}
