const crypto = require("crypto")
const { getUser } = require("../lib/dbuser")

module.exports = {
  name: "setpin",
  command: ["setpin"],
  tags: ["user"],
  usedCmd: ["setpin <4digit>"],

  async handler({ m, senderId, args }) {
    const user = getUser(senderId)

    if (!user.registered) {
      return m.reply("❌ Kamu belum daftar\nGunakan: daftar nama umur")
    }

    const pin = args[0]
    if (!/^\d{4}$/.test(pin)) {
      return m.reply("❌ PIN harus 4 angka")
    }

    const hash = crypto.createHash("sha256").update(pin).digest("hex")

    user.bank = user.bank || { balance: 0, pin: null }
    user.bank.pin = hash

    m.reply("✅ PIN bank berhasil dibuat")
  }
}
