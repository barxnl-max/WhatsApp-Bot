const axios = require("axios")

module.exports = {
  name: "jadwalsholat",
  command: ["jadwalsholat"],
  tags: ["islam"],
  limit: false,

  async handler({ m, args }) {
    if (!args[0]) {
      return m.reply(
        "🕌 *JADWAL SHOLAT*\n\n" +
        "Contoh:\n" +
        "• .jadwalsholat surabaya\n" +
        "• .jadwalsholat jakarta"
      )
    }

    const kota = args.join(" ").toLowerCase()

    try {
      // 1. Ambil daftar kota
      const kotaRes = await axios.get(
        "https://api.myquran.com/v2/sholat/kota/semua"
      )

      const listKota = kotaRes.data.data
      const found = listKota.find(v =>
        v.lokasi.toLowerCase().includes(kota)
      )

      if (!found) {
        return m.reply("❌ Kota tidak ditemukan")
      }

      // 2. Ambil tanggal hari ini
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, "0")
      const dd = String(now.getDate()).padStart(2, "0")

      // 3. Ambil jadwal sholat
      const jadwalRes = await axios.get(
        `https://api.myquran.com/v2/sholat/jadwal/${found.id}/${yyyy}/${mm}/${dd}`
      )

      const j = jadwalRes.data.data.jadwal

      // 4. Reply
      return m.reply(
        `🕌 *JADWAL SHOLAT*\n\n` +
        `📍 Kota: *${found.lokasi}*\n` +
        `📅 Tanggal: ${dd}-${mm}-${yyyy}\n\n` +
        `🌄 Subuh : ${j.subuh}\n` +
        `🌅 Dzuhur: ${j.dzuhur}\n` +
        `🌇 Ashar : ${j.ashar}\n` +
        `🌆 Maghrib: ${j.maghrib}\n` +
        `🌃 Isya  : ${j.isya}`
      )

    } catch (e) {
      return m.reply("❌ Gagal mengambil jadwal sholat")
    }
  }
}

