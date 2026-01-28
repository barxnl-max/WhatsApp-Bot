const { getUser } = require("../lib/dbuser")

module.exports = {
  name: "otransfer",
  command: ["otransfer"],
  tags: ["owner"],
  owner: true,
  limit: false,

  async handler({ sock, m, chatId, senderId, args, isOwner }) {
    if (!isOwner) {
      return m.reply("❌ Command ini hanya untuk owner")
    }

    const mention =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mention) {
      return m.reply(
        "❌ Tag user tujuan\n\nContoh:\n.otransfer @user 5000"
      )
    }

    const amount = parseInt(args[1])
    if (!amount || amount <= 0) {
      return m.reply("❌ Jumlah tidak valid")
    }

    const target = getUser(mention)

    if (!target.bank || typeof target.bank.balance !== "number") {
      return m.reply("❌ User belum punya bank")
    }

    target.bank.balance += amount

    await sock.sendMessage(
      chatId,
      {
        text:
          `👑 *OWNER TRANSFER*\n\n` +
          `👤 Ke : @${mention.split("@")[0]}\n` +
          `💰 Jumlah : ${amount.toLocaleString()}\n\n` +
          `🏦 Saldo bank sekarang:\n` +
          `${target.bank.balance.toLocaleString()}`,
        mentions: [mention]
      },
      { quoted: m }
    )
  }
}