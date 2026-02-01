const fetch = require("node-fetch")

async function translateText(text, lang) {
  const url = new URL("https://translate.googleapis.com/translate_a/single")
  url.searchParams.append("client", "gtx")
  url.searchParams.append("sl", "auto")
  url.searchParams.append("dt", "t")
  url.searchParams.append("tl", lang)
  url.searchParams.append("q", text)

  const res = await fetch(url.href)
  const data = await res.json()

  if (!data || !Array.isArray(data[0])) return null

  const translation = data[0].map(v => v[0]).join("")
  const detected = data[2]

  return {
    translation,
    detected
  }
}

module.exports = {
  name: "translate",
  command: ["tr", "translate"],
  tags: ["tools"],
  usedCmd: [
    "translate <lang> <text>"
  ],
  limit: true,

  async handler({ m, args }) {
    const lang = (args[0] || "").toLowerCase()

    let text = args.slice(1).join(" ").trim()

    if (!text && m.quoted?.text) {
      text = m.quoted.text.trim()
    }

    if (!lang || !text) {
      return m.reply(
        "🌐 *TRANSLATE*\n\n" +
        "Gunakan:\n" +
        "• .tr <lang> <text>\n" +
        "• .tr <lang> (reply teks)\n\n" +
        "Contoh:\n" +
        ".tr en aku cinta kamu\n" +
        ".tr id (reply pesan)"
      )
    }

    try {
      const res = await translateText(text, lang)
      if (!res) return m.reply("❌ Gagal menerjemahkan teks")

      return m.reply(
        "🌐 *TRANSLATE*\n\n" +
        "📥 Text:\n" +
        text + "\n\n" +
        "📤 Result:\n" +
        res.translation + "\n\n" +
        "🔤 Target : " + lang.toUpperCase() + "\n" +
        "🧠 Detect : " + (res.detected || "auto")
      )
    } catch (e) {
      console.error("TRANSLATE ERROR:", e)
      return m.reply("❌ Error saat menerjemahkan")
    }
  }
}

