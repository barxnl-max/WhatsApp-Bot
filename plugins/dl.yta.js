
const ytmp3 = require("../lib/ytmp3")

const MAX_MB = 30

const parseSizeMB = size => {
  if (!size) return 0
  const m = size.match(/([\d.]+)\s*MB/i)
  return m ? parseFloat(m[1]) : 0
}

module.exports = {
  name: "ytmp3",
  command: ["ytmp3", "yta"],
  tags: ["downloader"],
  limit: true,
  usedCmd: ["ytmp3 <url>"],

  async handler({ m, args, sock }) {
    const url = args.find(v => /youtu\.be|youtube\.com/.test(v))

    if (!url) {
      return m.reply(
        "🎵 *YTMP3*\n\n" +
        "Gunakan:\n" +
        ".ytmp3 <url youtube>\n" +
        ".yta <url youtube>\n\n" +
        "Max size: 30 MB"
      )
    }

    await sock.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    })

    let res
    try {
      res = await ytmp3(url)
    } catch (e) {
      console.error(e)
      return m.reply("❌ Gagal mengambil audio")
    }

    if (!res || !res.status || !res.buffer) {
      return m.reply("❌ Audio tidak ditemukan")
    }

    const sizeMB = parseSizeMB(res.size)

    if (sizeMB > MAX_MB) {
      return m.reply(
        "❌ *Ukuran terlalu besar*\n\n" +
        `📦 Size : ${res.size}\n` +
        `🚫 Limit : ${MAX_MB} MB`
      )
    }

    const caption =
      "🎧 *YOUTUBE MP3*\n\n" +
      `📌 Judul   : ${res.title}\n` +
      `📦 Size    : ${res.size}\n` +
      `🎼 Bitrate : ${res.bitrate}`

    await sock.sendMessage(
      m.chat,
      {
        audio: res.buffer,
        mimetype: "audio/mpeg",
        fileName: `${res.title}.mp3`,
        caption
      },
      { quoted: m }
    )

    await sock.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    })
  }
}
