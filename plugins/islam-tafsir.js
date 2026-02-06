const axios = require("axios")

module.exports = {
  name: "tafsir",
  command: ["tafsir"],
  tags: ["islam"],
  limit: false,

  async handler({ m, args }) {
    if (!args || args.length < 2) {
      return m.reply(
        "📖 *TAFSIR AL-QUR'AN*\n\n" +
        "Format:\n" +
        "• .tafsir <surah> <ayat>\n" +
        "• .tafsir <surah> <ayat> <kemenag|jalalayn|quraish>\n\n" +
        "Contoh:\n" +
        "• .tafsir 1 1\n" +
        "• .tafsir 2 255 jalalayn"
      )
    }

    const surah = Number(args[0])
    const ayat = Number(args[1])
    const jenis = (args[2] || "kemenag").toLowerCase()

    if (isNaN(surah) || isNaN(ayat)) {
      return m.reply("❌ Surah dan ayat harus berupa angka")
    }

    try {
      const url = `https://api.myquran.com/v3/quran/${surah}/${ayat}`
      const res = await axios.get(url, {
        headers: { Accept: "application/json" }
      })

      if (!res.data || !res.data.status) {
        return m.reply("❌ Data tafsir tidak ditemukan")
      }

      const d = res.data.data
      let tafsirText = ""

      if (jenis === "kemenag") {
        tafsirText = d.tafsir?.kemenag?.long
      } else if (jenis === "jalalayn") {
        tafsirText = d.tafsir?.jalalayn
      } else if (jenis === "quraish") {
        tafsirText = d.tafsir?.quraish
      } else {
        return m.reply("❌ Jenis tafsir tidak valid")
      }

      if (!tafsirText) {
        return m.reply("❌ Tafsir tidak tersedia")
      }

      return m.reply(
        `📖 *TAFSIR AL-QUR'AN*\n\n` +
        `📌 Surah : ${d.surah_number}\n` +
        `📍 Ayat  : ${d.ayah_number}\n` +
        `📚 Tafsir: ${jenis.toUpperCase()}\n\n` +
        `🕋 *Arab:*\n${d.arab}\n\n` +
        `📘 *Arti:*\n${d.translation}\n\n` +
        `📝 *Tafsir:*\n${tafsirText}`
      )

    } catch (err) {
      console.error(err)
      return m.reply("❌ Gagal mengambil tafsir")
    }
  }
}
