const { getGroup, saveGroupDB } = require("../lib/dbgroup");

module.exports = {
  name: "bangroup",
  command: ["ban", "unban", "listbangroup"],
  tags: ["admin"],
  usedCmd: [
    "ban <tag @user>",
    "unban <tag @user>",
    "listbangroup"
  ],
  group: true,
  ownerAdmin: true, // contoh admin grup dan owner bisa pake
  premium: true,

  async handler({ sock, m, chatId, command, isOwner, isAdmin }) {
 

    const group = getGroup(chatId);
    const ctx = m.message?.extendedTextMessage?.contextInfo;
    let targets = [];

    if (ctx?.mentionedJid?.length) {
      targets = ctx.mentionedJid;
    } else if (ctx?.participant) {
      targets = [ctx.participant];
    }

    if (command === "ban") {
      if (!targets.length) {
        return m.reply(
          "❌ Gunakan:\n" +
          "• Reply pesan user\n" +
          "• Tag user (@user)"
        );
      }

      for (const jid of targets) {
        group.banned[jid] = {
          by: m.sender,
          at: Date.now()
        };
      }

      saveGroupDB();

      return sock.sendMessage(chatId, {
        text:
          "⛔ *USER DIBAN*\n\n" +
          targets.map(j => `• @${j.split("@")[0]}`).join("\n"),
        mentions: targets
      });
    }

    if (command === "unban") {
      if (!targets.length) {
        return m.reply("❌ Reply atau tag user yang mau di-unban");
      }

      let removed = [];

      for (const jid of targets) {
        if (group.banned[jid]) {
          delete group.banned[jid];
          removed.push(jid);
        }
      }

      saveGroupDB();

      if (!removed.length) {
        return m.reply("⚠️ User tidak ada di daftar ban");
      }

      return sock.sendMessage(chatId, {
        text:
          "✅ *USER DIUNBAN*\n\n" +
          removed.map(j => `• @${j.split("@")[0]}`).join("\n"),
        mentions: removed
      });
    }

    if (command === "listbangroup") {
      const banned = Object.keys(group.banned || {});
      if (!banned.length) {
        return m.reply("✅ Tidak ada user yang diban di grup ini");
      }

      let teks = "⛔ *DAFTAR BAN GRUP*\n\n";

      banned.forEach((jid, i) => {
        teks += `${i + 1}. @${jid.split("@")[0]}\n`;
      });

      return sock.sendMessage(chatId, {
        text: teks,
        mentions: banned
      });
    }
  }
};
