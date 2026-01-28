module.exports = {
  name: "kerang",
  command: ["kerang"],
  usedCmd: ["kerang <pertanyaan>"],
  tags: ["fun"],
  limit: false,

  async handler({ m, args }) {
    if (!args.length) {
      return m.reply("❓ Tanyakan sesuatu ke kerang ajaib\n\nContoh:\nkerang dia suka aku gak?")
    }

    const jawaban = [
      "Ya",
      "Tidak",
      "Mungkin",
      "Bisa jadi",
      "Sepertinya iya",
      "Sepertinya tidak",
      "Sudah pasti",
      "Jangan berharap",
      "Coba tanya lagi nanti",
      "Aku ragu",
      "Menurutku sih iya",
      "Menurutku sih enggak",
      "Fokus ke hal lain dulu",
      "Takdir berkata iya",
      "Takdir berkata tidak",
      "Kamu siap menerima jawabannya?",
      "Kerang sedang capek, tapi jawabannya iya",
      "Kerang menolak menjawab",
      "Lebih baik jangan",
      "Gas aja"
    ]

    const hasil = jawaban[Math.floor(Math.random() * jawaban.length)]

    const pertanyaan = args.join(" ")

    await m.reply(
      `🦪 *KERANG AJAIB*\n\n` +
      `❓ Pertanyaan:\n${pertanyaan}\n\n` +
      `🔮 Jawaban:\n*${hasil}*`
    )
  }
}