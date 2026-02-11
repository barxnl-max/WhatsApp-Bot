const { getGroup } = require("../lib/dbgroup")

module.exports = {
  name: "banchat",
  command: ["banchat", "unbanchat"],
  group: true,
  admin: true,
  usedCmd: ["banchat", "unbanchat"],
  tags: ["admin"],

  async handler({ m, chatId, command }) {
    const group = getGroup(chatId)

    if (command === "banchat") {
      if (group.banchat) {
        return m.reply("🚫 Grup ini sudah dibanned")
      }

      group.banchat = true
      return m.reply(
        "🚫 *BANCHAT AKTIF*\n\n" +
        "Bot tidak bisa digunakan di grup ini\n" +
        "Gunakan *unbanchat* untuk membuka kembali"
      )
    }

    if (command === "unbanchat") {
      if (!group.banchat) {
        return m.reply("✅ Grup ini tidak dalam keadaan banned")
      }

      group.banchat = false
      return m.reply(
        "✅ *BANCHAT DINONAKTIFKAN*\n\n" +
        "Bot sudah bisa digunakan kembali"
      )
    }
  }
}
