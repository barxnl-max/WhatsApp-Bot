const fetch = require("node-fetch")

module.exports = {
  name: "waifu",
  command: ["randomwaifu"],
  tags: ["random"],
  limit: true,

  async handler({ sock, m, chatId, args, isGroup, isOwner }) {
    try {
      const isNSFW = args.includes("--nsfw")

      if (isNSFW && isGroup && !isOwner) {
        return m.reply("🔞 NSFW tidak diizinkan di grup")
      }

      const url =
        "https://api.waifu.im/search/?" +
        "is_nsfw=" + (isNSFW ? "true" : "false")

      const res = await fetch(url)
      if (!res.ok) return m.reply("❌ API error")

      const json = await res.json()
      if (!json.images || !json.images.length) {
        return m.reply("❌ Gambar tidak ditemukan")
      }

      const data = json.images[0]

      const caption =
        "🎨 *PIXIV " + (isNSFW ? "NSFW 🔞" : "SFW") + "*\n\n" +
        "🏷 Tags : " +
        (data.tags && data.tags.length
          ? data.tags.map(t => t.name).join(", ")
          : "-")

      await sock.sendMessage(chatId, {
        image: { url: data.url },
        caption,
      })
    } catch (e) {
      console.error("PIXIV NO COOKIE ERROR:", e)
      m.reply("❌ Gagal ambil gambar")
    }
  },
}
