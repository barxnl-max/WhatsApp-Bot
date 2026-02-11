const axios = require("axios")
const { getUser, addCredit } = require("../lib/dbuser")

const CREDIT_REWARD = 1500
const LIMIT_REWARD = 2
const TIMEOUT = 2 * 60 * 1000

global.SAMBUNG_AYAT ||= {}

module.exports = {
  name: "sambungayat",
  command: ["sambungayat"],
  group: true,
  tags: ["game", "islam"],

  async handler({ sock, m, chatId }) {
    if (global.SAMBUNG_AYAT[chatId]) {
      return m.reply("⚠️ Masih ada sesi sambung ayat yang aktif")
    }

    const res = await axios.get("https://api.myquran.com/v2/quran/ayat/acak")
    const d = res.data.data

    const fullArab = d.ayat.arab
    const words = fullArab.split(" ")
    const cutIndex = Math.floor(words.length * 0.45)

    const soal = words.slice(0, cutIndex).join(" ")
    const jawabanBenar = words.slice(cutIndex).join(" ")

    const opsi = [jawabanBenar]

    while (opsi.length < 4) {
      const r = await axios.get("https://api.myquran.com/v2/quran/ayat/acak")
      const fake = r.data.data.ayat.arab
      if (!opsi.includes(fake)) opsi.push(fake)
    }

    shuffle(opsi)

    const labels = ["A", "B", "C", "D"]
    const pilihan = {}
    let correctKey = ""

    opsi.forEach((v, i) => {
      pilihan[labels[i]] = v
      if (v === jawabanBenar) correctKey = labels[i]
    })

    const audioMsg = await sock.sendMessage(chatId, {
      audio: { url: d.ayat.audio },
      mimetype: "audio/mpeg"
    }, { quoted: m })

    global.SAMBUNG_AYAT[chatId] = {
      correct: correctKey,
      surah: d.info.surat.nama.id,
      ayah: d.ayat.ayah,
      timeout: Date.now() + TIMEOUT
    }

    let text =
      "📖 *SAMBUNG AYAT*\n\n" +
      soal + "\n\n"

    for (const k of labels) {
      text += `*${k}.* ${pilihan[k]}\n\n`
    }

    text +=
      "✍️ Reply *A / B / C / D*\n" +
      "❗ Hanya 1x kesempatan\n" +
      "⏱ 2 menit"

    await sock.sendMessage(chatId, { text }, { quoted: audioMsg })
  },

  async responder({ sock, m }) {
    if (!m.isGroup || !m.text) return false

    const chatId = m.chat
    const s = global.SAMBUNG_AYAT[chatId]
    if (!s) return false

    if (Date.now() > s.timeout) {
      delete global.SAMBUNG_AYAT[chatId]
      await sock.sendMessage(chatId, {
        text:
          "⏰ *WAKTU HABIS*\n\n" +
          `📖 ${formatSurah(s.surah)}\nAyat ${s.ayah}`
      })
      return true
    }

    const jawab = m.text.trim().toUpperCase()
    if (!["A", "B", "C", "D"].includes(jawab)) return true

    delete global.SAMBUNG_AYAT[chatId]

    if (jawab !== s.correct) {
      await sock.sendMessage(chatId, {
        text:
          "❌ *JAWABAN SALAH*\n\n" +
          `Jawaban benar: *${s.correct}*\n` +
          `📖 ${formatSurah(s.surah)} ayat ${s.ayah}`
      })
      return true
    }

    const user = getUser(m.sender)
    addCredit(user, CREDIT_REWARD)

    if (!user.limit) {
      user.limit = { daily: 0, lastReset: Date.now() }
    }
    user.limit.daily += LIMIT_REWARD

    await m.reply(
        "✅ *JAWABAN BENAR!*\n\n" +
        `📖 ${formatSurah(s.surah)} ayat ${s.ayah}\n\n` +
        "🎁 *REWARD*\n" +
        `💳 Credit : +${CREDIT_REWARD}\n` +
        `🎟️ Limit  : +${LIMIT_REWARD}\n\n` +
        "✨ MasyaAllah!"
    )
    return true
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

function formatSurah(name) {
  return name
    .split("-")
    .map(v => v.charAt(0).toUpperCase() + v.slice(1))
    .join("-")
}
