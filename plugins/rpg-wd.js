const crypto = require("crypto")
const { getUser } = require("../lib/dbuser")

module.exports = {
  name: "withdraw",
  command: ["withdraw", "tarik", "wd"],
  tags: ["user"],
  usedCmd: ["withdraw <jumlah>"],

  async handler({ m, senderId, args }) {
    const user = getUser(senderId)
    user.bank = user.bank || { balance: 0, pin: null }

    if (!user.bank.pin) {
      return m.reply("❌ Kamu belum set PIN\nGunakan: setpin 1234")
    }

    const amount = Number(args[0])
    if (!amount || amount <= 0) {
      return m.reply("❌ Jumlah tidak valid")
    }

    if (user.bank.balance < amount) {
      return m.reply("❌ Saldo bank tidak cukup")
    }

    const sent = await m.reply(
      "🔐 *VERIFIKASI PIN BANK*\n\n" +
      `💰 Jumlah : ${amount}\n\n` +
      "Silakan *reply pesan ini* dengan PIN kamu"
    )

    global.REPLY_SESSIONS.set(senderId, {
      plugin: "withdraw",
      msgId: sent.key.id,
      amount,
      expire: Date.now() + 60_000
    })
  },

  async onReply({ m, session }) {
    if (!session) return
    if (Date.now() > session.expire) {
      global.REPLY_SESSIONS.delete(m.sender)
      return m.reply("⏳ Sesi withdraw kadaluarsa")
    }

    if (!m.text) return
    const pin = m.text.trim()

    if (!/^\d{4}$/.test(pin)) {
      return m.reply("❌ PIN harus 4 angka")
    }

    const user = getUser(m.sender)
    user.bank = user.bank || { balance: 0, pin: null }

    const hash = crypto.createHash("sha256").update(pin).digest("hex")

    if (hash !== user.bank.pin) {
      return m.reply("❌ PIN salah")
    }

    if (user.bank.balance < session.amount) {
      return m.reply("❌ Saldo bank tidak cukup")
    }

    user.bank.balance -= session.amount
    user.credit += session.amount

    global.REPLY_SESSIONS.delete(m.sender)

    await m.reply(
      "✅ *WITHDRAW BERHASIL*\n\n" +
      `💳 Credit +${session.amount}\n` +
      `🏦 Sisa Bank : ${user.bank.balance}`
    )
  }
}
