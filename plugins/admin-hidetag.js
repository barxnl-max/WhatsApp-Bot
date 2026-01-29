const { downloadContentFromMessage } = require("@whiskeysockets/baileys")
const fs = require("fs")
const path = require("path")

async function downloadMedia(msg, type) {
  const stream = await downloadContentFromMessage(msg, type)
  let buffer = Buffer.from([])
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
  const file = path.join(process.cwd(), "temp", `${Date.now()}.${type}`)
  fs.writeFileSync(file, buffer)
  return file
}

module.exports = {
  name: "hidetag",
  command: ["hidetag"],
  usedCmd: ["hidetag <text / reply>"],
  tags: ["admin"],
  group: true,
  admin: true,
  botAdmin: true,
  limit: false,

  async handler({ sock, m, chatId, args }) {
    const groupMetadata = await sock.groupMetadata(chatId)
    const members = groupMetadata.participants || []

    const targets = members
      .filter(p => !p.admin)
      .map(p => p.id)

    if (!targets.length) {
      return m.reply("❌ Tidak ada member non-admin")
    }

    const text = args.join(" ")
    const quoted = m.quoted?.message

    if (quoted) {
      let content = null

      if (quoted.imageMessage) {
        const file = await downloadMedia(quoted.imageMessage, "image")
        content = {
          image: { url: file },
          caption: text || quoted.imageMessage.caption || "",
          mentions: targets
        }
      }

      else if (quoted.videoMessage) {
        const file = await downloadMedia(quoted.videoMessage, "video")
        content = {
          video: { url: file },
          caption: text || quoted.videoMessage.caption || "",
          mentions: targets
        }
      }

      else if (quoted.documentMessage) {
        const file = await downloadMedia(quoted.documentMessage, "document")
        content = {
          document: { url: file },
          fileName: quoted.documentMessage.fileName,
          caption: text || "",
          mentions: targets
        }
      }

      else if (quoted.conversation || quoted.extendedTextMessage) {
        content = {
          text: quoted.conversation || quoted.extendedTextMessage.text,
          mentions: targets
        }
      }

      if (content) {
        await sock.sendMessage(chatId, content)
        return
      }
    }

    await sock.sendMessage(chatId, {
      text: text || "📢 Panggilan grup",
      mentions: targets
    })
  }
}

