const axios = require("axios")

async function isgd(url) {
  const res = await axios.get(
    `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`
  )
  return res.data
}

async function tinyurl(url) {
  const res = await axios.get(
    `http://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
  )
  return res.data
}

async function vgd(url) {
  const res = await axios.get(
    `https://v.gd/create.php?format=simple&url=${encodeURIComponent(url)}`
  )
  return res.data
}

module.exports = {
  name: "short",
  command: ["short", "shortlink"],
  tags: ["tools"],
  usedCmd: [
    "shortlink <url>",
  ],
  limit: true,

  async handler({ m, args }) {
    const option = (args[0] || "").toLowerCase()
    const url = args.find(v => /^https?:\/\//i.test(v))

    if (!url) {
      return m.reply(
        "🔗 *URL SHORTENER*\n\n" +
        "Gunakan:\n" +
        "• .short <url>\n" +
        "• .short isgd <url>\n" +
        "• .short tinyurl <url>\n" +
        "• .short vgd <url>\n\n" +
        "Contoh:\n" +
        ".short https://google.com\n" +
        ".short tinyurl https://google.com"
      )
    }

    try {
      let short
      let provider

      switch (option) {
        case "isgd":
        case "is.gd":
          short = await isgd(url)
          provider = "is.gd"
          break

        case "tiny":
        case "tinyurl":
          short = await tinyurl(url)
          provider = "TinyURL"
          break

        case "vgd":
        case "v.gd":
          short = await vgd(url)
          provider = "v.gd"
          break

        default:
          short = await isgd(url)
          provider = "is.gd (default)"
      }

      return m.reply(
        "✅ *SHORTLINK BERHASIL*\n\n" +
        "🔗 Original:\n" +
        url + "\n\n" +
        "✂️ Short:\n" +
        short + "\n\n" +
        "⚙️ Provider: " + provider
      )

    } catch (e) {
      console.error("SHORT ERROR:", e)
      return m.reply("❌ Gagal membuat shortlink")
    }
  }
}

