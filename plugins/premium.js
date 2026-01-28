const { getUser } = require("../lib/dbuser");

module.exports = {
  name: "premium",
  command: ["addpremium", "delpremium", "listpremium"],
  tags: ["owner"],
  owner: true,

  async handler({ sock, m, chatId, senderId, command }) {
    // LIST PREMIUM
    if (command === "listpremium") {
      const users = Object.entries(global.db)
        .filter(([_, u]) => u.premium)
        .map(([jid]) => jid);

      if (!users.length) {
        return m.reply("📭 Belum ada user premium");
      }

      const list = users
        .map((u, i) => `${i + 1}. @${u.split("@")[0]}`)
        .join("\n");

      return sock.sendMessage(chatId, {
        text: `📋 *LIST PREMIUM USER*\n\n${list}`,
        mentions: users,
      });
    }

    // AMBIL TARGET (TAG / REPLY)
    let targets = [];

    const mention =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    const replyUser = m.message?.extendedTextMessage?.contextInfo?.participant;

    if (mention.length) {
      targets = mention;
    } else if (replyUser) {
      targets = [replyUser];
    }

    if (!targets.length) {
      return m.reply("❌ Tag atau reply user");
    }

    // ADD PREMIUM
    if (command === "addpremium") {
      for (const jid of targets) {
        const user = getUser(jid);
        user.premium = true;
      }

      const teks = targets.map((u) => `@${u.split("@")[0]}`).join(", ");

      return sock.sendMessage(chatId, {
        text: `✅ Premium diaktifkan untuk ${teks}`,
        mentions: targets,
      });
    }

    // DEL PREMIUM
    if (command === "delpremium") {
      for (const jid of targets) {
        const user = getUser(jid);
        user.premium = false;
      }

      const teks = targets.map((u) => `@${u.split("@")[0]}`).join(", ");

      return sock.sendMessage(chatId, {
        text: `❌ Premium dicabut dari ${teks}`,
        mentions: targets,
      });
    }
  },
};
