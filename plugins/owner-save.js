const fs = require("fs")
const path = require("path")

module.exports = {
  name: "save",
  command: ["save"],
  tags: ["owner"],
  usedCmd: ".save <path/file.js>",
  owner: true,

  async handler({ m, args }) {
    if (!m.quoted) return m.reply("❌ Reply pesan yang mau disimpan")
    if (!args[0]) return m.reply("❌ Tentukan path file")

    const content =
      m.quoted.text ||
      m.quoted.caption ||
      m.quoted.message?.conversation

    if (!content) return m.reply("❌ Pesan tidak mengandung teks")

    const filePath = path.join(process.cwd(), args[0])
    const dir = path.dirname(filePath)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(filePath, content)

    await m.reply(`✅ Disimpan ke:\n${args[0]}`)
  }
}