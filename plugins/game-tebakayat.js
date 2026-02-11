const axios = require("axios")
const similarity = require("string-similarity")
const { getUser, addCredit } = require("../lib/dbuser")

const CREDIT_REWARD = 1500
const LIMIT_REWARD = 2
const TIMEOUT = 3 * 60 * 1000

global.TEBAK_AYAT ||= {}

module.exports = {
  name: "tebakayat",
  command: ["tebakayat"],
  group: true,
  tags: ["game", "islam"],

  async handler({ sock, m, chatId }) {
    if (global.TEBAK_AYAT[chatId]) {
      return m.reply("⚠️ Masih ada sesi tebak ayat yang aktif")
    }

    const res = await axios.get("https://api.myquran.com/v2/quran/ayat/acak")
    const d = res.data.data

    const surahId = Number(d.info.surat.id)
    const surahName = d.info.surat.nama.id.toLowerCase()
    const ayah = Number(d.ayat.ayah)

    const audioMsg = await sock.sendMessage(
      chatId,
      {
        audio: { url: d.ayat.audio },
        mimetype: "audio/mpeg"
      },
      { quoted: m }
    )

    global.TEBAK_AYAT[chatId] = {
      surahId,
      surahName,
      ayah,
      audioMsgId: audioMsg.key.id,
      timeout: Date.now() + TIMEOUT
    }

    await sock.sendMessage(
      chatId,
      {
        text:
          "📖 *TEBAK AYAT*\n\n" +
          `${d.ayat.arab}\n\n` +
          `Artinya:\n_${d.ayat.text}_\n\n` +
          "❓ Ayat di atas berasal dari surat apa?\n\n" +
          "✏️ Jawab dengan:\n" +
          "• Nama surat\n" +
          "• Nomor surat\n\n" +
          "🏳️ Ketik *nyerah* untuk menyerah\n" +
          "⏱ Waktu 3 menit"
      },
      { quoted: audioMsg }
    )
  },

  async responder({ sock, m }) {
    if (!m.isGroup || !m.text) return false

    const chatId = m.chat
    const sesi = global.TEBAK_AYAT[chatId]
    if (!sesi) return false

    const text = m.text.toLowerCase().trim()

    if (Date.now() > sesi.timeout) {
      delete global.TEBAK_AYAT[chatId]
      await sock.sendMessage(chatId, {
        text:
          "⏰ *WAKTU HABIS*\n\n" +
          `📖 Surat : *${formatSurah(sesi.surahName)}*\n` +
          `🔢 Ayat  : ${sesi.ayah}`
      })
      return true
    }

    if (text === "nyerah") {
      delete global.TEBAK_AYAT[chatId]
      await sock.sendMessage(chatId, {
        text:
          "🏳️ *MENYERAH*\n\n" +
          `📖 Surat : *${formatSurah(sesi.surahName)}*\n` +
          `🔢 Ayat  : ${sesi.ayah}`
      })
      return true
    }

    const jawab = text.replace(/[^a-z0-9]/g, "")
    const kunci = sesi.surahName.replace(/[^a-z0-9]/g, "")

    if (jawab === kunci || jawab === String(sesi.surahId)) {
      delete global.TEBAK_AYAT[chatId]

      const user = getUser(m.sender)
      addCredit(user, CREDIT_REWARD)

      if (!user.limit) {
        user.limit = { daily: 0, lastReset: Date.now() }
      }

      user.limit.daily += LIMIT_REWARD

      await sock.sendMessage(chatId, {
        text:
          "✅ *JAWABAN BENAR!*\n\n" +
          `📖 Surat : *${formatSurah(sesi.surahName)}*\n` +
          `🔢 Ayat  : ${sesi.ayah}\n\n` +
          "🎁 *REWARD*\n" +
          `💳 Credit : +${CREDIT_REWARD}\n` +
          `🎟️ Limit  : +${LIMIT_REWARD}\n\n` +
          "✨ MasyaAllah!"
      })
      return true
    }

    const score = similarity.compareTwoStrings(jawab, kunci)

    if (score >= 0.6) {
      await sock.sendMessage(
        chatId,
        { text: "⚠️ Hampir benar, periksa ejaan nama suratnya" },
        { quoted: m }
      )
      return true
    }

    await sock.sendMessage(
      chatId,
      { text: "❌ Jawaban salah, coba lagi!" },
      { quoted: m }
    )

    return true
  }
}

function formatSurah(name) {
  return name
    .split("-")
    .map(v => v.charAt(0).toUpperCase() + v.slice(1))
    .join("-")
}
