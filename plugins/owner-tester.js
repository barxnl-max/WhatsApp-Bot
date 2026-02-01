const {
  addTester,
  removeTester,
  getTesterList,
} = require("../lib/botMode")

module.exports = {
  name: "tester",
  command: ["addtester", "deltester", "listtester"],
  tags: ["owner"],
  owner: true,

  async handler({ sock, m, chatId, command }) {
    /* ======================
        LIST TESTER
    ====================== */
    if (command === "listtester") {
      const testers = getTesterList()

      if (!testers.length) {
        return m.reply("📭 Belum ada tester")
      }

      const list = testers
        .map((u, i) => `${i + 1}. @${u.split("@")[0]}`)
        .join("\n")

      return sock.sendMessage(chatId, {
        text: `🧪 *LIST TESTER*\n\n${list}`,
        mentions: testers,
      })
    }

    /* ======================
        AMBIL TARGET
        (TAG / REPLY)
    ====================== */
    let targets = []

    const mention =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

    const replyUser =
      m.message?.extendedTextMessage?.contextInfo?.participant

    if (mention.length) {
      targets = mention
    } else if (replyUser) {
      targets = [replyUser]
    }

    if (!targets.length) {
      return m.reply("❌ Tag atau reply user")
    }

    /* ======================
        ADD TESTER
    ====================== */
    if (command === "addtester") {
      for (const jid of targets) {
        addTester(jid)
      }

      const teks = targets.map(u => `@${u.split("@")[0]}`).join(", ")

      return sock.sendMessage(chatId, {
        text: `✅ Tester ditambahkan: ${teks}`,
        mentions: targets,
      })
    }

    /* ======================
        DEL TESTER
    ====================== */
    if (command === "deltester") {
      for (const jid of targets) {
        removeTester(jid)
      }

      const teks = targets.map(u => `@${u.split("@")[0]}`).join(", ")

      return sock.sendMessage(chatId, {
        text: `❌ Tester dihapus: ${teks}`,
        mentions: targets,
      })
    }
  },
}
