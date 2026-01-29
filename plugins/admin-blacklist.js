const { getGroup } = require("../lib/dbgroup")

module.exports = {
  name: "blacklist",
  command: ["blacklist"],
  tags: ["admin"],
  group: true,
  admin: true,
  botAdmin: true,

  async handler({ sock, m, chatId, args }) {
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
      return m.reply("❌ Tag atau reply user yang mau di-blacklist")
    }

    const isKick = args.includes("kick")

    for (const jid of users) {
      group.blacklist[jid] = {
        kick: isKick,
        time: Date.now()
      }

      if (isKick) {
        await sock.groupParticipantsUpdate(chatId, [jid], "remove")
      }
    }

    const teks = users.map(u => `@${u.split("@")[0]}`).join(", ")

    await sock.sendMessage(chatId, {
      text: isKick
        ? `🚫 Blacklist + Kick\n${teks}`
        : `🚫 User di-blacklist\nPesan akan otomatis dihapus\n${teks}`,
      mentions: users
    })
  }
}
