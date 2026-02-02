const fetch = require("node-fetch")
const cheerio = require("cheerio")
const CryptoJS = require("crypto-js")

async function getToken() {
  const req = await fetch("https://allinonedownloader.com/", {
    headers: { "User-Agent": "Mozilla/5.0" }
  })
  if (!req.ok) return null

  const html = await req.text()
  const $ = cheerio.load(html)

  const token = $("#token").val()
  const path = $("#scc").val()
  const cookie = req.headers.get("set-cookie")

  if (!token || !path) return null
  return { token, path, cookie }
}

function generateHash(url, token) {
  const key = CryptoJS.enc.Hex.parse(token)
  const iv = CryptoJS.enc.Hex.parse("afc4e290725a3bf0ac4d3ff826c43c10")

  return CryptoJS.AES.encrypt(url, key, {
    iv,
    padding: CryptoJS.pad.ZeroPadding
  }).toString()
}

async function downloadAIO(url) {
  const conf = await getToken()
  if (!conf) return { error: "🚫 Gagal ambil token server" }

  const { token, path, cookie } = conf
  const hash = generateHash(url, token)

  const body = new URLSearchParams()
  body.append("url", url)
  body.append("token", token)
  body.append("urlhash", hash)

  const req = await fetch("https://allinonedownloader.com" + path, {
    method: "POST",
    headers: {
      "Accept": "*/*",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cookie": cookie,
      "Referer": "https://allinonedownloader.com/",
      "User-Agent": "Mozilla/5.0",
      "X-Requested-With": "XMLHttpRequest"
    },
    body
  })

  if (!req.ok) return { error: "🚨 Request ke server gagal" }

  const json = await req.json().catch(() => null)
  if (!json) return { error: "⚠️ Response tidak valid" }

  return {
    title: json.title,
    duration: json.duration,
    source: json.source,
    thumbnail: json.thumbnail,
    links: json.links || []
  }
}

module.exports = {
  name: "aio",
  command: ["aio", "pinterest", "pindl", "facebook", "fbdl"],
  tags: ["downloader"],
  usedCmd: ["aio <url>", "pinterest <url>", "facebook <url>"],
  limit: true,

  async handler({ sock, m, chatId, args, prefix, command }) {
    const text = args.join(" ")
    if (!text) {
      return m.reply(
        `📦 *ALL-IN-ONE DOWNLOADER*\n\n` +
        `✨ Contoh:\n` +
        `${prefix + command} https://vt.tiktok.com/xxxx\n\n` +
        `🌍 Support Platform:\n` +
        `• TikTok\n• Instagram\n• Facebook\n• Twitter\n• Pinterest\n• Tumblr\n• Vimeo\n• Dailymotion\n• Imgur`
      )
    }

    await sock.sendMessage(chatId, {
      react: { text: "⏱️", key: m.key }
    })

    const res = await downloadAIO(text)
    if (res.error) {
      await sock.sendMessage(chatId, {
        react: { text: "💥", key: m.key }
      })
      return m.reply(res.error)
    }

    const caption =
      `🚀 *ALL-IN-ONE RESULT*\n\n` +
      `🎞️ Judul: ${res.title || "Tanpa Judul"}\n` +
      `⏰ Durasi: ${res.duration || "-"}\n` +
      `🔗 Sumber: ${res.source || "-"}`

    const video = res.links.find(v =>
      v.type === "mp4" || /\.mp4$/i.test(v.url)
    )

    if (video?.url) {
      await sock.sendMessage(chatId, {
        video: { url: video.url },
        caption
      }, { quoted: m })

      return sock.sendMessage(chatId, {
        react: { text: "🎉", key: m.key }
      })
    }

    const images = res.links.filter(v =>
      /\.(jpg|jpeg|png|webp)$/i.test(v.url)
    )

    if (images.length) {
      for (let i = 0; i < images.length; i++) {
        await sock.sendMessage(chatId, {
          image: { url: images[i].url },
          caption: i === 0 ? caption : undefined
        }, { quoted: m })
      }

      return sock.sendMessage(chatId, {
        react: { text: "🖼️", key: m.key }
      })
    }

    await sock.sendMessage(chatId, {
      react: { text: "🤷", key: m.key }
    })
    m.reply("❌ Media tidak ditemukan")
  }
}
