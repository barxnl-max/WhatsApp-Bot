const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "../data/stickercmd.json");

if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");

const loadDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveDB = (d) => fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2));

global.stickerCmd = loadDB();

module.exports = {
  name: "setcmd",
  command: ["setcmd", "delcmd", "listcmd"],
  tags: ["tools"],
  owner: true,

  usedCmd: ["setcmd <teks>", "delcmd", "listcmd"],

  async handler({ m, command, args }) {
    const db = loadDB();

    if (command === "setcmd") {
      if (!m.quoted) return m.reply("❌ Reply stickernya");
      if (!args[0]) return m.reply("❌ Masukkan command");

      const sticker = m.quoted.message?.stickerMessage;
      if (!sticker) return m.reply("❌ Itu bukan sticker");

      const sha = Buffer.from(sticker.fileSha256).toString("hex");
      const cmd = args[0].replace(/^\./, "").toLowerCase();

      db[sha] = cmd;
      saveDB(db);
      global.stickerCmd = db;

      return m.reply(`✅ Sticker diset jadi command:\n.${cmd}`);
    }

    if (command === "delcmd") {
      if (!m.quoted) return m.reply("❌ Reply stickernya");

      const sticker = m.quoted.message?.stickerMessage;
      if (!sticker) return m.reply("❌ Itu bukan sticker");

      const sha = Buffer.from(sticker.fileSha256).toString("hex");
      if (!db[sha]) return m.reply("❌ Sticker belum ada command");

      delete db[sha];
      saveDB(db);
      global.stickerCmd = db;

      return m.reply("🗑️ Sticker command dihapus");
    }

    if (command === "listcmd") {
      const list = Object.values(db);
      if (!list.length) return m.reply("📭 Belum ada sticker command");

      return m.reply(
        "📌 *STICKER COMMAND LIST*\n\n" + list.map((v) => `• .${v}`).join("\n"),
      );
    }
  },
};
