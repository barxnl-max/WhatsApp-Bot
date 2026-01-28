const { getUser } = require("../lib/dbuser")

module.exports = {
  name: "bank",
  command: ["bank"],
  tags: ["user"],
  usedCmd: ["bank"],

  async handler({ m, senderId }) {
    const user = getUser(senderId)
    user.bank = user.bank || { balance: 0 }

    m.reply(
      `🏦 *BANK ACCOUNT*\n\n` +
      `💰 Saldo Bank : ${user.bank.balance}\n` +
      `💳 Credit     : ${user.credit}`
    )
  }
}