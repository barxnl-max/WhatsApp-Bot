const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/goodbye.json");

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, "{}");
}

function loadDB() {
  return JSON.parse(fs.readFileSync(DB_PATH));
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function formatText(text, user, group) {
  return text
    .replace(/@user/gi, `@${user.split("@")[0]}`)
    .replace(/@group/gi, group);
}

module.exports = {
  name: "goodbye",

  command: ["goodbye"],

  group: true,
  admin: true,

  tags: ["group", "admin"],

  usedCmd: ["goodbye on", "goodbye off", "goodbye set <teks>"],

  async handler({ m, chatId, args, isAdmin, isOwner }) {
    if (!isAdmin && !isOwner) {
      return m.reply("❌ Hanya admin grup");
    }

    const db = loadDB();
    if (!db[chatId]) {
      db[chatId] = {
        enabled: false,
        text: "👋 Selamat tinggal @user\nSemoga bahagia di luar @group",
      };
    }

    const sub = (args[0] || "").toLowerCase();

    if (!sub) {
      return m.reply(
        "Penggunaan:\n" +
          ".goodbye on\n" +
          ".goodbye off\n" +
          ".goodbye set <teks>\n\n" +
          "Tag:\n" +
          "@user = user keluar\n" +
          "@group = nama grup",
      );
    }

    if (sub === "on") {
      db[chatId].enabled = true;
      saveDB(db);
      return m.reply("✅ Goodbye diaktifkan");
    }

    if (sub === "off") {
      db[chatId].enabled = false;
      saveDB(db);
      return m.reply("❌ Goodbye dimatikan");
    }

    if (sub === "set") {
      const text = args.slice(1).join(" ");
      if (!text) {
        return m.reply("❌ Masukkan teks goodbye");
      }

      db[chatId].text = text;
      saveDB(db);

      return m.reply("✅ Teks goodbye disimpan");
    }

    return m.reply("❌ Perintah tidak valid");
  },

  async onGroupLeave({ sock, chatId, participants, groupMetadata }) {
    const db = loadDB();
    const data = db[chatId];

    if (!data || !data.enabled) return;

    for (const user of participants) {
      const text = formatText(data.text, user, groupMetadata.subject);

      await sock.sendMessage(chatId, {
        text,
        mentions: [user],
      });
    }
  },
};