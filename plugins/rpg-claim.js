const { getUser, addCredit } = require("../lib/dbuser")

const COOLDOWN = 6 * 60 * 60 * 1000 // 6 jam
const BANK_REWARD = 1500
const CREDIT_REWARD = 1500
const LIMIT_REWARD = 1

module.exports = {
  name: "claim",
  command: ["claim", "daily"],
  tags: ["main"],
  limit: false,

  async handler({ m, senderId }) {
    const user = getUser(senderId)
    const now = Date.now()

    if (!user.registered) {
      return m.reply(
        "❌ Kamu belum terdaftar\n" +
        "Gunakan: daftar nama umur"
      )
    }

    if (now - (user.lastClaim || 0) < COOLDOWN) {
      const wait = COOLDOWN - (now - user.lastClaim)
      const jam = Math.floor(wait / 3600000)
      const menit = Math.ceil((wait % 3600000) / 60000)

      return m.reply(
        `⏳ *CLAIM BELUM TERSEDIA*\n\n` +
        `Tunggu ${jam} jam ${menit} menit lagi`
      )
    }

    // ====== INIT BANK ======
    if (!user.bank) {
      user.bank = {
        balance: 0,
        pin: null
      }
    }

    // ====== REWARD ======
    user.bank.balance += BANK_REWARD
    addCredit(user, CREDIT_REWARD)

    if (!user.limit) {
      user.limit = {
        daily: 0,
        lastReset: Date.now()
      }
    }

    user.limit.daily += LIMIT_REWARD
    user.lastClaim = now

    let text =
      `🎁 *CLAIM BERHASIL!*\n\n` +
      `🏦 Saldo Bank  : +${BANK_REWARD}\n` +
      `💳 Credit     : +${CREDIT_REWARD}\n` +
      `🎟️ Limit       : +${LIMIT_REWARD}\n\n` +
      `🕒 Claim berikutnya 6 jam lagi`

    await m.reply(text)
  }
}