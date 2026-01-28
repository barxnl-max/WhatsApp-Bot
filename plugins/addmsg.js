const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const DB_FILE = path.join(DATA_DIR, "autorespon.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");

const loadDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveDB = (d) => fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2));
const rand = (a) => a[Math.floor(Math.random() * a.length)];

module.exports = {
  name: "autorespon",

  command: ["addmsg", "delmsg", "listmsg"],

  usedCmd: ["addmsg <trigger> (reply)", "delmsg <trigger>", "listmsg"],

  tags: ["tools"],
  group: true,

  async handler({ m, command, args }) {
    const db = loadDB();

    if (command === "addmsg") {
      if (!args[0]) return m.reply("❌ .addmsg <trigger> (reply)");
      if (!m.quoted) return m.reply("❌ Reply pesan yang mau disimpan");

      const key = args[0].toLowerCase();
      if (!db[key]) db[key] = [];

      db[key].push(m.quoted);
      saveDB(db);

      return m.reply(
        `✅ Disimpan\nTrigger: *${key}*\nTotal: ${db[key].length}`,
      );
    }

    if (command === "delmsg") {
      const key = args[0]?.toLowerCase();
      if (!key) return m.reply("❌ .delmsg <trigger>");
      if (!db[key]) return m.reply("❌ Trigger tidak ditemukan");

      delete db[key];
      saveDB(db);
      return m.reply(`🗑️ Trigger *${key}* dihapus`);
    }

    if (command === "listmsg") {
      const keys = Object.keys(db);
      if (!keys.length) return m.reply("📭 Belum ada autorespon");

      let text = "📌 *AUTORESPON LIST*\n\n";
      for (const k of keys) {
        text += `• ${k} (${db[k].length})\n`;
      }

      return m.reply(text.trim());
    }
  },

  async responder({ sock, m }) {
    if (!m.text) return false;
    if (m.text.startsWith(".")) return false;

    const db = loadDB();
    const text = m.text.toLowerCase();

    for (const key in db) {
      if (text.includes(key)) {
        const msg = rand(db[key]);

        await sock.copyNForward(m.chat, msg, true, { quoted: m });

        return true;
      }
    }

    return false;
  },
};
