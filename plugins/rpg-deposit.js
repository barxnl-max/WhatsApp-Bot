const { getUser } = require("../lib/dbuser")

module.exports = {
  name: "deposit",
  command: ["deposit"],
  tags: ["user"],
  usedCmd: ["deposit <jumlah>"],

  async handler({ m, senderId, args }) {
    const user = getUser(senderId)
    const amount = Number(args[0])

    if (!amount || amount <= 0) {
      return m.reply("❌ Jumlah tidak valid")
    }

    if (user.credit < amount) {
      return m.reply("❌ Credit tidak cukup")
    }

    user.bank = user.bank || { balance: 0 }
    user.credit -= amount
    user.bank.balance += amount

    m.reply(`✅ Deposit berhasil\n💰 +${amount} ke bank`)
  }
}