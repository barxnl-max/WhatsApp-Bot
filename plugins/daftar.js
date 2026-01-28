const { getUser } = require("../lib/dbuser")

if (!global.REPLY_SESSIONS) global.REPLY_SESSIONS = new Map()

module.exports = {
  name: "daftar",
  command: ["daftar", "register"],
  usedCmd: "daftar <nama> <umur>",
  tags: ["user"],
  limit: false,

  async handler({ m, senderId }) {
    const user = getUser(senderId)
    const args = m.text.trim().split(/\s+/).slice(1)

    if (user.registered) {
      return m.reply("❌ Kamu sudah terdaftar")
    }

    if (args.length < 2) {
      return m.reply(
        "❌ Format salah\n\n" +
        "Contoh:\n" +
        "daftar akbar 20"
      )
    }

    const name = args.slice(0, -1).join(" ")
    const age = Number(args[args.length - 1])

    if (!name || name.length < 2) {
      return m.reply("❌ Nama tidak valid")
    }

    if (isNaN(age)) {
      return m.reply("❌ Umur harus berupa angka")
    }

    if (age < 10) {
      return m.reply(
        "❌ Pendaftaran ditolak\n" +
        "Umur minimal 10 tahun"
      )
    }

    if (age > 30) {
      return m.reply(
        "❌ Pendaftaran ditolak\n" +
        "Umur maksimal 30 tahun"
      )
    }

    const sent = await m.reply(
      "📝 *PENDAFTARAN*\n\n" +
      `👤 Nama : ${name}\n` +
      `🎂 Umur : ${age}\n\n` +
      "Balas pesan ini dengan:\n" +
      "pria / wanita"
    )

    global.REPLY_SESSIONS.set(senderId, {
      plugin: "daftar",
      msgId: sent.key.id,
      data: { name, age },
      expire: Date.now() + 2 * 60 * 1000
    })
  },

  async onReply({ m, session }) {
    if (!session) return
    if (session.plugin !== "daftar") return

    if (Date.now() > session.expire) {
      global.REPLY_SESSIONS.delete(m.sender)
      return m.reply("⏳ Sesi pendaftaran habis")
    }

    if (!m.quoted || m.quoted.key.id !== session.msgId) return

    const gender = m.text?.toLowerCase().trim()
    if (!["pria", "wanita"].includes(gender)) {
      return m.reply("❌ Jawab dengan: pria / wanita")
    }

    const user = getUser(m.sender)

    user.registered = true
    user.name = session.data.name
    user.age = session.data.age
    user.gender = gender
    user.registeredAt = Date.now()

    global.REPLY_SESSIONS.delete(m.sender)

    await m.reply(
      "🎉 *PENDAFTARAN BERHASIL*\n\n" +
      `👤 Nama   : ${user.name}\n` +
      `🎂 Umur   : ${user.age}\n` +
      `🚻 Gender : ${gender}\n\n` +
      "✅ Kamu sekarang bisa menggunakan bot"
    )
  }
}