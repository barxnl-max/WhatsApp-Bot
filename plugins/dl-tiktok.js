const axios = require("axios")
const { tiktokDownload } = require("../lib/scraper/TikTok")

const MAX_VIDEO = 100 * 1024 * 1024

async function getFileSize(url) {
  try {
    const res = await axios.head(url)
    return Number(res.headers["content-length"] || 0)
  } catch {
    return 0
  }
}

module.exports = {
  name: "tiktok",
  command: ["tiktok", "tt"],
  usedCmd: ["tiktok <url> [--wm]"],
  tags: ["downloader"],

  async handler({ sock, m, chatId, args, usedPrefix, command }) {
    const url = args.find(v =>
      /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com)/i.test(v)
    )

    if (!url) {
      return m.reply(
        `❌ Contoh:\n` +
        `${usedPrefix}${command} https://vt.tiktok.com/xxxx`
      )
    }

    const useWM = args.includes("--wm")

    await sock.sendMessage(chatId, {
      react: { text: "⏳", key: m.key }
    })

    const data = await tiktokDownload(url)
    if (!data) return m.reply("❌ Gagal mengambil data TikTok")

    const title = (data.title || "TikTok").slice(0, 80)
    const author = data.author?.nickname || "-"
    const videoUrl = useWM ? data.wm : data.no_wm || data.hd

    if (!videoUrl) return m.reply("❌ Video tidak tersedia")

    const size = await getFileSize(videoUrl)
    const isBig = size > MAX_VIDEO

    const caption =
      `🎬 *TikTok Downloader*\n\n` +
      `📌 Judul: ${title}\n` +
      `👤 Author: ${author}\n` +
      `📦 Size: ${size ? (size / 1024 / 1024).toFixed(2) + " MB" : "Unknown"}`

    await sock.sendFile(
      m.chat,
      videoUrl,
      {
        quoted: m,
        asDocument: isBig,
        fileName: `${title}.mp4`,
        caption
      }
    )

    if (data.music) {
      await sock.sendFile(
        m.chat,
        data.music,
        {
          quoted: m,
          fileName: `${title}.mp3`,
          mimetype: "audio/mpeg"
        }
      )
    }

    await sock.sendMessage(chatId, {
      react: { text: "✅", key: m.key }
    })
  }
}
