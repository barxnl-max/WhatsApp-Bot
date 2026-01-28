const crypto = require("crypto")
const { getUser } = require("../lib/dbuser")

module.exports = {
  name: "withdraw",
  command: ["withdraw", "tarik"],
  tags: ["user"],
  usedCmd: ["withdraw <jumlah> <pin>"],

  async handler({ m, senderId, args }) {
    const user = getUser(senderId)
    user.bank = user.bank || { balance: 0, pin: null }

    if (!user.bank.pin) {
      return m.reply("❌ Kamu belum set PIN\nGunakan: setpin 1234")
    }

    const amount = Number(args[0])
    const pin = args[1]

    if (!amount || amount <= 0) {
      return m.reply("❌ Jumlah tidak valid")
    }

    if (!pin) {
      return m.reply("❌ PIN diperlukan")
    }

    const hash = crypto.createHash("sha256").update(pin).digest("hex")

    if (hash !== user.bank.pin) {
      return m.reply("❌ PIN salah")
    }

    if (user.bank.balance < amount) {
      return m.reply("❌ Saldo bank tidak cukup")
    }

    user.bank.balance -= amount
    user.credit += amount

    m.reply(`✅ Penarikan berhasil\n💳 +${amount} credit`)
  }
}