const { getBotMode, setBotMode } = require("../lib/botMode")

module.exports = {
  name: "mode",
  command: ["mode"],
  owner: true,
  tags: ["owner"],

  async handler({ m, args }) {
    const mode = args[0]?.toLowerCase()

    const list = [
      "self",
      "private",
      "group",
      "private_group",
      "public"
    ]

    if (!mode) {
      return m.reply(
        `🔐 *BOT MODE*\n\n` +
        `Mode saat ini: *${getBotMode()}*\n\n` +
        `Gunakan:\n` +
        list.map(v => `• .mode ${v}`).join("\n")
      )
    }

    if (!list.includes(mode)) {
      return m.reply(
        "❌ Mode tidak valid\n\n" +
        "Mode tersedia:\n" +
        list.join(", ")
      )
    }

    setBotMode(mode)
    await m.reply(`✅ Mode bot diubah ke *${mode.toUpperCase()}*`)
  }
}
