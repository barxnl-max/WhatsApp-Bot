const fetch = require("node-fetch")
const FormData = require("form-data")
const { JSDOM } = require("jsdom")

async function webp2mp4(source) {
  const form = new FormData()
  const isUrl = typeof source === "string" && /^https?:\/\//.test(source)

  form.append("new-image-url", isUrl ? source : "")
  if (!isUrl) form.append("new-image", source, "image.webp")

  const res = await fetch("https://ezgif.com/webp-to-mp4", {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html"
    }
  })

  const html = await res.text()
  const { document } = new JSDOM(html).window

  const file = document.querySelector('input[name="file"]')?.value
  const convert = document.querySelector('input[name="convert"]')?.value

  if (!file || !convert) throw new Error("Upload failed")

  const form2 = new FormData()
  form2.append("file", file)
  form2.append("convert", convert)

  const res2 = await fetch(`https://ezgif.com/webp-to-mp4/${file}`, {
    method: "POST",
    body: form2,
    headers: {
      ...form2.getHeaders(),
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html"
    }
  })

  const html2 = await res2.text()
  const { document: doc2 } = new JSDOM(html2).window

  const src =
    doc2.querySelector("video source")?.getAttribute("src") ||
    doc2.querySelector('a[href$=".mp4"]')?.getAttribute("href")

  if (!src) throw new Error("Convert failed")

  return src.startsWith("http") ? src : `https:${src}`
}

async function webp2png(source) {
  const form = new FormData()
  const isUrl = typeof source === "string" && /^https?:\/\//.test(source)

  form.append("new-image-url", isUrl ? source : "")
  if (!isUrl) form.append("new-image", source, "image.webp")

  const res = await fetch("https://ezgif.com/webp-to-png", {
    method: "POST",
    body: form,
    headers: {
      ...form.getHeaders(),
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html"
    }
  })

  const html = await res.text()
  const { document } = new JSDOM(html).window

  const file = document.querySelector('input[name="file"]')?.value
  const convert = document.querySelector('input[name="convert"]')?.value

  if (!file || !convert) throw new Error("Upload failed")

  const form2 = new FormData()
  form2.append("file", file)
  form2.append("convert", convert)

  const res2 = await fetch(`https://ezgif.com/webp-to-png/${file}`, {
    method: "POST",
    body: form2,
    headers: {
      ...form2.getHeaders(),
      "User-Agent": "Mozilla/5.0",
      Accept: "text/html"
    }
  })

  const html2 = await res2.text()
  const { document: doc2 } = new JSDOM(html2).window

  const src =
    doc2.querySelector("div#output img")?.getAttribute("src")

  if (!src) throw new Error("Convert failed")

  return src.startsWith("http") ? src : `https:${src}`
}

module.exports = { webp2mp4, webp2png }
