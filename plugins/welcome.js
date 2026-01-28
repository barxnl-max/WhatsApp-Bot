const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/welcome.json");

function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH));
  } catch {
    return {};
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

module.exports = {
  name: "welcome",
  command: ["welcome"],
  usedCmd: ["welcome on/off", "welcome set <teks>"],
  group: true,
  admin: true,
  botAdmin: false,
  tags: ["admin"],

  async handler({ m, chatId, args, isAdmin, isOwner }) {
    if (!isAdmin && !isOwner) {
      return m.reply("❌ Hanya admin grup yang bisa mengatur welcome");
    }

    const db = loadDB();
    if (!db[chatId]) {
      db[chatId] = {
        enabled: false,
        text:
          "👋 Selamat datang @user di grup *{group}*\n\n" +
          "Semoga betah ya ✨",
      };
    }

    const action = args[0]?.toLowerCase();

    if (!action) {
      return m.reply(
        `👋 *WELCOME SETTING*\n\n` +
          `Status : ${db[chatId].enabled ? "ON" : "OFF"}\n\n` +
          `Gunakan:\n` +
          `.welcome on\n` +
          `.welcome off\n` +
          `.welcome set <teks>\n\n` +
          `Tag:\n` +
          `@user → user masuk\n` +
          `@group → nama grup`,
      );
    }

    if (action === "on") {
      db[chatId].enabled = true;
      saveDB(db);
      return m.reply("✅ Welcome diaktifkan");
    }

    if (action === "off") {
      db[chatId].enabled = false;
      saveDB(db);
      return m.reply("❌ Welcome dimatikan");
    }

    if (action === "set") {
      const text = args.slice(1).join(" ");
      if (!text) {
        return m.reply("❌ Masukkan teks welcome");
      }

      db[chatId].text = text;
      saveDB(db);
      return m.reply("✅ Teks welcome berhasil diubah");
    }

    m.reply("❌ Perintah tidak dikenal");
  },

  async onGroupJoin({ sock, chatId, participants, groupMetadata }) {
    const db = loadDB();
    const data = db[chatId];
    if (!data || !data.enabled) return;

    for (const user of participants) {
      const teks = data.text
        .replace(/@user/g, `@${user.split("@")[0]}`)
        .replace(/@group/g, groupMetadata.subject);

      await sock.sendMessage(chatId, {
        text: teks,
        mentions: [user],
      });
    }
  },
};
