const yts = require("yt-search")
const ytmp3 = require("../lib/ytmp3")

function formatDuration(sec) {
  sec = Number(sec)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return [
    h ? String(h).padStart(2, "0") : null,
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0")
  ].filter(Boolean).join(":")
}

function formatViews(num) {
  return Number(num || 0).toLocaleString("id-ID")
}

module.exports = {
  name: "play",
  command: ["play", "ytmp3"],
  tags: ["downloader"],
  usedCmd: [
    "play <judul lagu>",
    "ytmp3 <url youtube>"
  ],
  limit: true,

  async handler({ sock, m, chatId }) {
    try {
      const text =
        m.text ||
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        ""

      const query = text.split(" ").slice(1).join(" ").trim()

      if (!query) {
        return m.reply(
          "🎵 *PLAY / YTMP3*\n\n" +
          "Gunakan:\n" +
          "• .play <judul lagu>\n" +
          "• .play <url youtube>\n" +
          "• .ytmp3 <url youtube>"
        )
      }

      await sock.sendMessage(chatId, {
        react: { text: "⏳", key: m.key }
      })

      let video
      let url = query

      if (!/^https?:\/\//i.test(query)) {
        const search = await yts(query)
        if (!search.videos || !search.videos.length) {
          return m.reply("❌ Lagu tidak ditemukan")
        }
        video = search.videos[0]
        url = video.url
      } else {
        const search = await yts({ videoId: query })
        video = search
      }

      if (!video || !video.seconds) {
        return m.reply("❌ Gagal mengambil data video")
      }

      if (video.seconds > 600) {
        return m.reply(
          "⏱ *DURASI TERLALU PANJANG*\n\n" +
          "❌ Maksimal durasi audio: 10 menit\n" +
          `🎧 Durasi video: ${formatDuration(video.seconds)}`
        )
      }

      const res = await ytmp3(url)
      if (!res || !res.status) {
        return m.reply("❌ Gagal download audio")
      }

      const title = video.title || res.title || "audio"
      const channel = video.author?.name || "-"
      const duration = formatDuration(video.seconds)
      const views = formatViews(video.views)
      const upload = video.ago || "-"

      await sock.sendMessage(
        chatId,
        {
          image: { url: res.thumbnail },
          caption:
            "🎵 *" + title + "*\n\n" +
            "👤 Channel : " + channel + "\n" +
            "⏱ Duration : " + duration + "\n" +
            "👁 Views    : " + views + "\n" +
            "📅 Upload   : " + upload + "\n" +
            "🔗 URL      : " + url + "\n\n" +
            "🎧 Audio    : " + res.bitrate + "\n" +
            "📦 Size     : " + res.size
        },
        { quoted: m }
      )

      await sock.sendMessage(
        chatId,
        {
          audio: res.buffer,
          mimetype: "audio/mpeg",
          fileName: title.replace(/[^\w\d]/gi, "_") + ".mp3"
        },
        { quoted: m }
      )

      await sock.sendMessage(chatId, {
        react: { text: "✅", key: m.key }
      })

    } catch (e) {
      console.error("PLAY ERROR:", e)
      m.reply("❌ Terjadi kesalahan, coba lagi nanti")
    }
  }
}