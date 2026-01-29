const { getGroup } = require("../lib/dbgroup")

module.exports = {
  name: "unblacklist",
  command: ["unblacklist"],
  tags: ["admin"],
  group: true,
  admin: true,

  async handler({ sock, m, chatId }) {
    const group = getGroup(chatId)
    if (!group.blacklist) group.blacklist = {}

    let users = []

    const mention =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid

    const replyUser =
      m.message?.extendedTextMessage?.contextInfo?.participant

    if (mention?.length) {
      users = mention
    } else if (replyUser) {
      users = [replyUser]
    }

    if (!users.length) {
      return m.reply("❌ Tag atau reply user yang mau di-unblacklist")
    }

    let removed = []

    for (const jid of users) {
      if (group.blacklist[jid]) {
        delete group.blacklist[jid]
        removed.push(jid)
      }
    }

    if (!removed.length) {
      return m.reply("⚠️ User tidak ada di blacklist")
    }

    await sock.sendMessage(chatId, {
      text: `✅ Unblacklist berhasil:\n${removed
        .map(u => `@${u.split("@")[0]}`)
        .join(", ")}`,
      mentions: removed
    })
  }
}
