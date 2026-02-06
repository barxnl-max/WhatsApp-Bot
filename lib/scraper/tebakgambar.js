/* BY MUHAMMAD AKBAR */

const axios = require("axios")
const cheerio = require("cheerio")

function randomLevel(max = 208) {
  const seed = Math.floor((Date.now() * Math.E) % 1000000)
  return (seed % max) + 1
}

async function fetchLevel(level) {
  const url = `https://www.cademedia.com/kunci-jawaban-tebak-gambar-level-${level}`

  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  })

  const $ = cheerio.load(data)
  const results = []

  $("p strong").each((_, el) => {
    const text = $(el).text().trim()
    const match = text.match(/Level\s+\d+\s+Nomor\s+(\d+)/i)
    if (!match) return

    const nomor = Number(match[1])
    let image = null
    let jawaban = null
    let penjelasan = ""

    const container = $(el).parent()

    const desc = container.nextAll("p").first()
    if (desc.text().toLowerCase().includes("gambar")) {
      penjelasan = desc.text().trim()
    }

    const img = container.nextAll("div.wp-block-image").first().find("img")
    if (img.length) image = img.attr("src")

    container.nextAll("p").each((_, p) => {
      const t = $(p).text()
      if (/jawaban\s*:/i.test(t)) {
        jawaban = t.replace(/jawaban\s*:/i, "").trim().toUpperCase()
        return false
      }
    })

    results.push({
      nomor,
      image,
      jawaban,
      penjelasan
    })
  })

  return { url, level, results }
}

async function tebakgambar() {
  let attempt = 0
  const maxRetry = 5

  while (attempt < maxRetry) {
    const level = randomLevel(208)
    const res = await fetchLevel(level)

    const invalid = res.results.some(v => !v.image || !v.jawaban)

    if (!invalid && res.results.length > 0) {
      return {
        source: res.url,
        level: res.level,
        total: res.results.length,
        data: res.results
      }
    }

    attempt++
  }

  return {
    error: true,
    message: "Gagal mendapatkan data valid",
    retry: maxRetry
  }
}

module.exports = tebakgambar
