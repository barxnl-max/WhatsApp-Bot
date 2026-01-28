const fs = require("fs");
const path = require("path");

const MODE_PATH = path.join(__dirname, "../data/messageCount.json");

function getMode() {
  try {
    const data = JSON.parse(fs.readFileSync(MODE_PATH));
    return typeof data.isPublic === "boolean" ? data.isPublic : true;
  } catch {
    return true;
  }
}

function setMode(isPublic) {
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(MODE_PATH));
  } catch {}
  data.isPublic = isPublic;
  fs.writeFileSync(MODE_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "mode",
  command: ["mode"],
  owner: true,
  tags: ["owner"],

  async handler({ m, args }) {
    const action = args[0]?.toLowerCase();

    if (!action) {
      const current = getMode() ? "public" : "private";
      return m.reply(
        `🔐 *MODE BOT*\n\n` +
          `Mode saat ini: *${current}*\n\n` +
          `Gunakan:\n` +
          `.mode public\n` +
          `.mode private`,
      );
    }

    if (!["public", "private"].includes(action)) {
      return m.reply(
        "❌ Format salah\n\n" +
          "Gunakan:\n" +
          ".mode public\n" +
          ".mode private",
      );
    }

    setMode(action === "public");

    await m.reply(`✅ Mode bot berhasil diubah ke *${action.toUpperCase()}*`);
  },
};
