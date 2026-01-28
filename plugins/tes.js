const isAdmin = require("../lib/isAdmin");
// const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
module.exports = {
  name: "tes",
  command: ["tes"],

  owner: false,
  admin: false,
  premium: false,

  group: false,
  private: false,
  botAdmin: false,
  async handler({ m, sock, chatId, isGroup, isPrivate, senderId }) {
    const { isBotAdmin } = await isAdmin(sock, chatId, senderId);
    if (!isBotAdmin) {
      await sock.sendMessage(
        m.chat,
        { text: "Please make the bot an admin first." },
        { quoted: m },
      );
      return;
    }
    return m.reply(
      `✅ Plugin tes aktif\nGroup: ${isGroup}\nPrivate: ${isPrivate}`,
    );
  },
};
