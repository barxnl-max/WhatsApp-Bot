/* Semoga kita semua dalam perlindungan Allah 
-Muhammad Akbar */

const axios = require("axios")

module.exports = {
  name: "doa",
  command: ["doa"],
  tags: ["islam"],
  limit: false,
  usedCmd: ["doa <query>", "doa list", "doa"],
  async handler({ m, args }) {
    try {
      const res = await axios.get("https://equran.id/api/doa")
      const data = res.data?.data

      if (!Array.isArray(data) || !data.length) {
        return m.reply("❌ Doa tidak tersedia")
      }

      if (args[0] === "list") {
        let txt = "📿 *DAFTAR DOA*\n\n"
        for (const d of data) {
          txt += `• ${d.id}. ${d.nama}\n`
        }
        return m.reply(txt.trim())
      }

      if (args[0] && !isNaN(args[0])) {
        const doa = data.find(d => d.id == args[0])
        if (!doa) return m.reply("❌ Doa tidak ditemukan")
        return kirimDoa(m, doa)
      }

      if (args.length) {
        const key = args.join(" ").toLowerCase()
        const hasil = data.filter(d =>
          d.nama.toLowerCase().includes(key) ||
          d.idn.toLowerCase().includes(key) ||
          d.grup.toLowerCase().includes(key)
        )
        if (!hasil.length) return m.reply("❌ Doa tidak ditemukan")
        return kirimDoa(m, hasil[Math.floor(Math.random() * hasil.length)])
      }

      return kirimDoa(
        m,
        data[Math.floor(Math.random() * data.length)]
      )

    } catch {
      return m.reply("❌ Gagal mengambil data doa")
    }
  }
}

function kirimDoa(m, d) {
  return m.reply(`
📿 *${d.nama}*
📂 *Grup:* ${d.grup}

🕌 *Arab:*
${d.ar}

🔤 *Latin:*
${d.tr}

📖 *Arti:*
${d.idn}
`.trim())
}
