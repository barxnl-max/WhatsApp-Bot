const { getUser, getExpNeeded } = require("../lib/dbuser");

module.exports = {
  name: "profile",
  command: ["profile", "me"],
  tags: ["main"],
  usedCmd: ["profile", "me"],
  limit: false,

  async handler({ sock, m, senderId, isOwner, isPremium }) {
    let target = senderId;

    // 1️⃣ MENTION
    const mention =
      m.message?.extendedTextMessage?.contextInfo?.mentionedJid;

    if (mention && mention.length) {
      target = mention[0];
    }

    // 2️⃣ REPLY
    const replyUser =
      m.message?.extendedTextMessage?.contextInfo?.participant;

    if (!mention?.length && replyUser) {
      target = replyUser;
    }

    const user = getUser(target);

    const needExp = getExpNeeded(user.level);
    const progress = `${user.exp} / ${needExp}`;

    const username = target.split("@")[0];

    const displayName =
      user.registered && user.name
        ? user.name
        : m.pushName || "Unknown";

    const umur = user.registered ? user.age : "-";
    const gender = user.registered ? user.gender : "-";

    const text = `👤 *PROFILE USER*

👤 Nama   : ${displayName} (@${username})
🆔 ID     : ${target}

📋 Data Diri
• Umur    : ${umur}
• Gender  : ${gender}

⭐ Level  : ${user.level}
📊 EXP    : ${progress}
💳 Credit : ${user.credit}
🎟️ Limit  : ${isPremium ? "∞" : user.limit?.daily ?? 0}

👑 Owner  : ${isOwner && target === senderId ? "YES" : "NO"}
💎 Premium: ${user.premium ? "YES" : "NO"}`;

    await sock.sendMessage(
      m.chat,
      {
        text,
        mentions: [target],
      },
      { quoted: m }
    );
  },
};