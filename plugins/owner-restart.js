const fs = require("fs")
const path = require("path")

const TEMP_DIR = path.join(process.cwd(), "temp")

module.exports = {
  name: "restart",
  command: ["restart", "reboot"],
  owner: true,

  async handler({ m }) {
    // clear require cache
    for (const k of Object.keys(require.cache)) {
      delete require.cache[k]
    }

    // clear temp
    if (fs.existsSync(TEMP_DIR)) {
      for (const f of fs.readdirSync(TEMP_DIR)) {
        const p = path.join(TEMP_DIR, f)
        if (fs.statSync(p).isFile()) fs.unlinkSync(p)
      }
    }

    await m.reply("♻️ Restarting bot...\n🧹 Cache & temp dibersihkan")

    setTimeout(() => {
      process.exit(0)
    }, 1200)
  }
}
