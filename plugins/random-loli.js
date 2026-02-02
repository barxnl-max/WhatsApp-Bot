const fetch = require("node-fetch")

module.exports = {
  name: "pixiv",
  command: ["randomloli"],
  tags: ["random"],

  async handler({ sock, m, chatId, args, isGroup, isPremium, isOwner }) {
    try {
      // detect flag
      const isNSFW = args.includes("--nsfw")

      // optional restriction (boleh kamu hapus)
      if (isNSFW && isGroup && !isOwner) {
        return m.reply("🔞 NSFW tidak diizinkan di grup")
      }

      // hapus flag dari keyword
      const keyword = args
        .filter(a => a !== "--nsfw")
        .join(" ") || "anime"

      const url =
        "https://api.lolicon.app/setu/v2" +
        `?size=regular&num=1` +
        `&r18=${isNSFW ? 1 : 0}` +
        `&tag=${encodeURIComponent(keyword)}`

      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
      })

      if (!res.ok) {
        return m.reply("❌ Pixiv API error")
      }

      const json = await res.json()
      if (!json.data || !json.data.length) {
        return m.reply("❌ Gambar tidak ditemukan")
      }

      const data = json.data[0]

      const caption =
        `🎨 *PIXIV ${isNSFW ? "NSFW 🔞" : "SFW"}*\n\n` +
        `📌 Judul  : ${data.title}\n` +
        `👤 Author : ${data.author}\n` +
        `🏷 Tags   : ${data.tags.slice(0, 6).join(", ")}\n` +
        `🔗 https://www.pixiv.net/artworks/${data.pid}`

      await sock.sendMessage(chatId, {
        image: { url: data.urls.regular },
        caption,
      })
    } catch (e) {
      console.error("PIXIV ERROR:", e)
      m.reply("❌ Pixiv sedang error")
    }
  },
}
