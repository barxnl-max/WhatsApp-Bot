const cheerio = require("cheerio")
const { fetch } = require("undici")
const { lookup } = require("mime-types")

async function mediafireScraper(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Fetch gagal")

  const html = await res.text()
  const $ = cheerio.load(html)

  const filename = $(".dl-info .intro .filename").text().trim()
  const size = $('.details li:contains("File size:") span').text().trim()
  const uploaded = $('.details li:contains("Uploaded:") span').text().trim()

  const ext =
    /\(\.(.*?)\)/
      .exec($(".dl-info .filetype > span").eq(1).text())?.[1]
      ?.toLowerCase() || "bin"

  const mimetype = lookup(ext) || "application/octet-stream"
  const download = $(".input").attr("href")

  if (!download) throw new Error("Link download tidak ditemukan")

  return {
    filename,
    size,
    uploaded,
    mimetype,
    download
  }
}

module.exports = {
  name: "mediafire",
  command: ["mediafire", "mf"],
  usedCmd: ["mediafire <url>"],
  tags: ["downloader"],
  limit: true,

  async handler({ sock, m, args, chatId }) {
    const url = args[0]

    if (!url)
      return m.reply(
        "❌ Masukkan link MediaFire\n\n" +
        "Contoh:\n" +
        ".mediafire https://www.mediafire.com/file/xxxxx/file"
      )

    if (!/mediafire\.com\/file/.test(url))
      return m.reply("❌ Link bukan MediaFire")

    try {
      const data = await mediafireScraper(url)

      m.reply("⏳ Mengunduh file...")

      const fileRes = await fetch(data.download)
      if (!fileRes.ok) throw new Error("Download gagal")

      const buffer = Buffer.from(await fileRes.arrayBuffer())

      await sock.sendMessage(
        chatId,
        {
          document: buffer,
          fileName: data.filename,
          mimetype: data.mimetype,
          caption:
            `📁 *MEDIAFIRE DOWNLOAD*\n\n` +
            `📄 Nama : ${data.filename}\n` +
            `📏 Size : ${data.size}\n` +
            `📆 Upload : ${data.uploaded}`
        },
        { quoted: m }
      )
    } catch (e) {
      console.error("[MEDIAFIRE ERROR]", e)
      m.reply("❌ Gagal mengunduh file MediaFire")
    }
  }
}
