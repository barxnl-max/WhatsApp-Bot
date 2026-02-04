const axios = require("axios")
const fs = require("fs")
const path = require("path")
const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const { UploadFileUgu, TelegraPh } = require("../lib/uploader")

const API_KEY = "4923fb92851b48b6902a951489671d84"

async function downloadQuotedImage(m) {
  const ctx = m.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage
  if (!quoted?.imageMessage) return null

  const stream = await downloadContentFromMessage(
    quoted.imageMessage,
    "image"
  )

  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }
  return buffer
}

async function uploadImage(buffer) {
  const tmpDir = path.join(process.cwd(), "tmp")
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

  const file = path.join(tmpDir, Date.now() + ".jpg")
  fs.writeFileSync(file, buffer)

  let url
  try {
    url = await TelegraPh(file)
  } catch {
    const res = await UploadFileUgu(file)
    url = typeof res === "string" ? res : res.url
  }

  fs.unlinkSync(file)
  return url
}

async function bigjpgUpscale(imageUrl, style = "photo") {
  const create = await axios.post(
    "https://bigjpg.com/api/task/",
    {
      input: imageUrl,
      style,
      noise: "2",
      x2: "2"
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY
      }
    }
  )

  if (!create.data?.tid) {
    throw new Error("CREATE_FAILED")
  }

  const tid = create.data.tid

  while (true) {
    await new Promise(r => setTimeout(r, 3000))

    const check = await axios.get(
      "https://bigjpg.com/api/task/" + tid,
      {
        headers: { "X-API-KEY": API_KEY }
      }
    )

    const task = check.data?.[tid]
    if (!task) throw new Error("TASK_NOT_FOUND")

    if (task.status === "success") {
      return task.url
    }

    if (task.status === "error") {
      throw new Error("UPSCALE_ERROR")
    }
  }
}

module.exports = {
  name: "upscale",
  command: ["upscale", "hdr", "remini"],
  tags: ["tools"],
  limit: true,

  async handler({ m, sock }) {
    try {
      const buffer = await downloadQuotedImage(m)
      if (!buffer) {
        return m.reply("❌ Reply gambar untuk di-upscale")
      }

      await m.reply("✨ Upscaling gambar, tunggu sebentar...")

      const imageUrl = await uploadImage(buffer)
      const resultUrl = await bigjpgUpscale(imageUrl, "photo")

      await sock.sendMessage(
        m.chat,
        {
          image: { url: resultUrl },
          caption: "✨ Upscale / HDR selesai"
        },
        { quoted: m }
      )
    } catch (e) {
      console.error("[UPSCALE ERROR]", e)
      m.reply("❌ Gagal upscale gambar")
    }
  }
}
