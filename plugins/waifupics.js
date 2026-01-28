const fetch = require("node-fetch")
const fs = require("fs")
const path = require("path")
const EzGif = require("../lib/ezgif")

const SFW = [
  "waifu","neko","shinobu","megumin","bully","cuddle","cry","hug",
  "awoo","kiss","lick","pat","smug","bonk","yeet","blush","smile",
  "wave","highfive","handhold","nom","bite","glomp","slap","kick",
  "happy","wink","poke","dance","cringe"
]

const NSFW = ["waifu","neko","trap","blowjob"]

module.exports = {
  name: "waifupics",
  command: ["waifu","waifunsfw"],
  usedCmd: ["waifu <type>","waifunsfw <type>"],
  tags: ["random","nsfw"],
  nsfw: true,

  async handler({ sock, m, chatId, command, args }) {
    const nsfw = command === "waifunsfw"
    const hasRvo = args.includes("--rvo")
    const type = args.find(v => !v.startsWith("--")) || "waifu"
    const list = nsfw ? NSFW : SFW

    if (!list.includes(type)) {
      return sock.sendMessage(
        chatId,
        { text: `❌ Type tidak valid\n\nAvailable:\n${list.join(", ")}` },
        { quoted: m }
      )
    }

    const api = `https://api.waifu.pics/${nsfw ? "nsfw" : "sfw"}/${type}`
    const res = await fetch(api)
    const json = await res.json()
    if (!json?.url) {
      return sock.sendMessage(
        chatId,
        { text: "❌ Gagal ambil data dari API" },
        { quoted: m }
      )
    }

    const mediaRes = await fetch(json.url)
    const buffer = Buffer.from(await mediaRes.arrayBuffer())
    const ext = json.url.split(".").pop().toLowerCase()

    const tmpDir = path.join(process.cwd(), "tmp")
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    if (ext === "gif" || ext === "webp") {
      const input = path.join(tmpDir, Date.now() + "." + ext)
      fs.writeFileSync(input, buffer)
      const mp4Url = await EzGif.WebP2mp4(input)
      fs.unlinkSync(input)

      return sock.sendMessage(
        chatId,
        {
          video: { url: mp4Url },
          gifPlayback: true,
          viewOnce: hasRvo,
          caption: `🔥 waifu.pics (${type})`
        },
        { quoted: m }
      )
    }

    return sock.sendMessage(
      chatId,
      {
        image: buffer,
        viewOnce: hasRvo,
        caption: `🔥 waifu.pics (${type})`
      },
      { quoted: m }
    )
  }
}