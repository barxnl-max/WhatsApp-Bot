const fetch = require("node-fetch")

module.exports = {
  name: "github",
  command: ["cekupdate"],
  tags: ["info"],

  async handler({ m }) {
    try {
      const owner = "barxnl-max"
      const repo = "WhatsApp-Bot"

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`
      )
      const data = await res.json()

      if (!Array.isArray(data) || !data.length) {
        return m.reply("❌ Tidak ada data update")
      }

      let text =
        `📦 *UPDATE TERAKHIR*\n` +
        `🔗 Source : https://github.com/${owner}/${repo}\n\n`

      data.forEach((c, i) => {
        text +=
          `*${i + 1}.* ${c.commit.message}\n` +
          `👤 ${c.commit.author?.name || "Unknown"}\n` +
          `⏱️ ${new Date(c.commit.author?.date).toLocaleString()}\n` +
          `🔗 https://github.com/${owner}/${repo}/commit/${c.sha}\n\n`
      })

      m.reply(text.trim())
    } catch (e) {
      console.error("GITHUB ERROR:", e)
      m.reply("❌ Gagal ambil data GitHub")
    }
  },
}
