const axios = require("axios")

module.exports = {
  name: "alquran",
  command: ["alquran", "listsurah"],
  tags: ["islam"],

  async handler({ sock, m, args, command }) {
    if (command === "listsurah") {
      const res = await axios.get("https://api.quran.gading.dev/surah")
      const list = res.data.data
        .map(s => `${s.number}. ${s.name.transliteration.id}`)
        .join("\n")

      return m.reply(
        "📖 *DAFTAR SURAH*\n\n" +
        list +
        "\n\nGunakan:\n.alquran <surah> <ayat>"
      )
    }

    const surah = Number(args[0])
    const ayat = Number(args[1] || 1)

    if (!surah) return m.reply("Contoh:\n.alquran 1 1")

    const res = await axios.get(
      `https://api.quran.gading.dev/surah/${surah}/${ayat}`
    )

    const v = res.data.data

    const audioMsg = await sock.sendMessage(
      m.chat,
      {
        audio: { url: v.audio.primary },
        mimetype: "audio/mpeg"
      },
      { quoted: m }
    )

    const textMsg = await sock.sendMessage(
      m.chat,
      {
        text:
          `📖 *${v.surah.name.transliteration.id} : ${ayat}*\n\n` +
          `${v.text.arab}\n\n` +
          `📜 ${v.translation.id}\n\n` +
          `➡️ reply pesan ini dengan:\n` +
          `• next\n• stop`
      },
      { quoted: audioMsg }
    )

    global.REPLY_SESSIONS.set(m.sender, {
      plugin: "alquran",
      msgId: textMsg.key.id,
      expire: Date.now() + 5 * 60 * 1000,
      data: {
        surah,
        ayat,
        max: v.surah.numberOfVerses
      }
    })
  },

  async onReply({ sock, m, session }) {
    const text = m.text.toLowerCase().trim()
    const { surah, ayat, max } = session.data

    if (text === "stop") {
      global.REPLY_SESSIONS.delete(m.sender)
      return m.reply("✅ Bacaan dihentikan")
    }

    const nextAyat = ayat + 1
    if (nextAyat > max) {
      global.REPLY_SESSIONS.delete(m.sender)
      return m.reply("🏁 Surah selesai")
    }

    const res = await axios.get(
      `https://api.quran.gading.dev/surah/${surah}/${nextAyat}`
    )

    const v = res.data.data
    session.data.ayat = nextAyat

    const audioMsg = await sock.sendMessage(
      m.chat,
      {
        audio: { url: v.audio.primary },
        mimetype: "audio/mpeg"
      },
      { quoted: m }
    )

    const textMsg = await sock.sendMessage(
      m.chat,
      {
        text:
          `📖 *${v.surah.name.transliteration.id} : ${nextAyat}*\n\n` +
          `${v.text.arab}\n\n` +
          `📜 ${v.translation.id}\n\n` +
          `➡️ reply dengan *next* | *stop*`
      },
      { quoted: audioMsg }
    )

    session.msgId = textMsg.key.id
  }
}
