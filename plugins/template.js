module.exports = {
  /* ================= META ================= */
  name: "plugin-template",

  command: ["template", "ptemplate"],

  owner: true,
  admin: false,
  premium: false,
  group: false,
  private: false,
  botAdmin: false,

  tags: ["owner"],

  usedCmd: ["template"],

  /* ================= HANDLER ================= */
  async handler({ m, prefix }) {
    const template = `
/**
 * =========================================
 * PLUGIN TEMPLATE (STANDARD BOT)
 * Lokasi: /plugins/namaPlugin.js
 * =========================================
 *
 * =====================================================
 * 📦 DATABASE SYSTEM (WAJIB PAHAM)
 * =====================================================
 *
 * Bot menggunakan:
 *   global.db[senderId]
 *
 * Ambil user:
 *   const { 
 *     getUser,
 *     addExp,
 *     addCredit,
 *     useLimit,
 *     buyLimit,
 *     getExpNeeded
 *   } = require("../lib/dbuser")
 *
 *   const user = getUser(senderId)
 *
 * =====================================================
 * 🧍 STRUKTUR USER (DEFAULT – JANGAN DIUBAH)
 * =====================================================
 *
 * {
 *   level: 1,
 *   exp: 0,
 *   credit: 0,
 *   premium: false,
 *   age: null,        // hasil daftar
 *   gender: null,     // pria / wanita
 *   name: null,       // nama terdaftar
 *   registered: false,
 *   limit: {
 *     daily: 10,
 *     lastReset: <timestamp>
 *   },
 *   game: {},         // bebas (math, quiz, dll)
 *   afk: null,
 *   lastClaim: 0
 * }
 *
 * =====================================================
 * 🧠 REGISTRASI USER
 * =====================================================
 *
 * ❗ SEMUA COMMAND (KECUALI daftar) WAJIB CEK:
 *
 * if (!user.registered) {
 *   return m.reply(
 *     "❌ Kamu belum terdaftar\\n" +
 *     "Gunakan: daftar nama umur"
 *   )
 * }
 *
 * =====================================================
 * 🔞 NSFW (UMUR 18+)
 * =====================================================
 *
 * Tambahkan di META plugin:
 *   nsfw: true
 *
 * Di main.js akan otomatis cek:
 * - user.age harus ada
 * - user.age >= 18
 *
 * =====================================================
 * 🎟️ LIMIT SYSTEM
 * =====================================================
 *
 * Tambahkan di META plugin:
 *   limit: true
 *
 * Manual:
 *   const ok = useLimit(user, 1)
 *   if (!ok) return m.reply("Limit habis")
 *
 * Premium & Owner = infinite
 *
 * =====================================================
 * 💰 CREDIT & EXP
 * =====================================================
 *
 * Tambah EXP:
 *   addExp(user, 30)
 *
 * Tambah Credit:
 *   addCredit(user, 100)
 *
 * Level up otomatis:
 *   EXP dibutuhkan = 1000 * 10^(level-1)
 *
 * =====================================================
 * 🎁 CLAIM (6 JAM)
 * =====================================================
 *
 * Cooldown:
 *   6 jam (21600000 ms)
 *
 * Reward:
 *   +300 EXP
 *   +400 Credit
 *
 * =====================================================
 * 🎮 GAME SYSTEM
 * =====================================================
 *
 * Simpan game di:
 *   user.game.namaGame = {}
 *
 * Contoh:
 * user.game.math = {
 *   mode: "hard",
 *   chance: 3,
 *   answer: 20,
 *   expire: Date.now() + 30000
 * }
 *
 * =====================================================
 * 💎 PREMIUM SYSTEM
 * =====================================================
 *
 * Cek premium:
 *   const isPremium = isOwner || user.premium
 *
 * Command premium:
 *   addpremium @user
 *   delpremium @user
 *   listpremium
 *
 * Premium tetap WAJIB daftar
 *
 * =====================================================
 * ⚠️ RULE WAJIB
 * =====================================================
 * ❌ JANGAN ubah struktur user
 * ❌ JANGAN bikin db baru
 * ✅ BOLEH tambah properti baru
 *    contoh:
 *    user.lastSpin
 *    user.game.quiz
 *
 * =====================================================
 */

module.exports = {
  /* ============== META ============== */
  name: "example",

  command: ["example"],

  owner: false,
  admin: false,
  premium: false,
  nsfw: false,
  group: false,
  private: false,
  botAdmin: false,
  limit: true,

  tags: ["misc"],

  usedCmd: ["example <text>"],

  /* ============== HANDLER ============== */
  async handler({
    sock,
    m,
    chatId,
    senderId,
    args,
    isGroup,
    isPrivate,
    isOwner,
    isAdmin,
    isBotAdmin,
    prefix,
    isPremium,
    plugins,
    command
  }) {

    const {
      getUser,
      addExp,
      addCredit
    } = require("../lib/dbuser")

    const user = getUser(senderId)

    if (!user.registered) {
      return m.reply(
        "❌ Kamu belum terdaftar\\n" +
        "Gunakan: daftar nama umur"
      )
    }

    const text = args.join(" ")
    if (!text) {
      return m.reply(prefix + command + " halo")
    }

    await m.reply("✅ Kamu kirim: " + text)

    addExp(user, 30)
    addCredit(user, 10)

    await sock.sendMessage(chatId, {
      text: "EXP +30 | Credit +10"
    }, { quoted: m })

    await sock.sendMessage(chatId, {
      react: { text: "🔥", key: m.key }
    })
  },

  /* ============== REPLY SESSION ============== */
  async onReply({ sock, m, session }) {
    const text =
      m.text ||
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      ""

    if (!text) return

    await m.reply("📩 Reply diterima: " + text)
    global.REPLY_SESSIONS.delete(m.sender)
  },

  /* ============== AUTO RESPON ============== */
  async responder({ sock, m, prefix }) {
    if (!m.text) return false
    if (m.text.startsWith(prefix)) return false

    if (m.text.toLowerCase() === "halo") {
      await m.reply("Halo juga 👋")
      return true
    }

    return false
  },

  onLoad() {
    console.log("[PLUGIN] example loaded")
  },

  onUnload() {
    console.log("[PLUGIN] example unloaded")
  }
}
`.trim();

    await m.reply(
      "📦 *PLUGIN TEMPLATE + FULL DATABASE DOCS*\\n\\n" +
        "Simpan sebagai:\\n" +
        "`/plugins/namaPlugin.js`\\n\\n" +
        "```js\\n" +
        template +
        "\\n```",
    );
  },
};
