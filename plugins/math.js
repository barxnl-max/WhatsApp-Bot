const { getUser, addExp, addCredit } = require("../lib/dbuser");

if (!global.REPLY_SESSIONS) global.REPLY_SESSIONS = new Map();

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(ms) {
  return Math.floor(ms / 1000) + " detik";
}

/**
 * Reward EXP & Credit
 */
function getReward(mode) {
  const rewards = {
    easy: 40,
    medium: 80,
    hard: 160,
    impossible: 320,
    impossible2: 640,
  };
  return rewards[mode] || 0;
}

/**
 * Generate soal
 */
function generateQuestion(mode) {
  let a, b, c, expr, answer, time;

  switch (mode) {
    case "easy":
      a = rand(1, 10);
      b = rand(1, 10);
      expr = `${a} + ${b}`;
      answer = a + b;
      time = 45000;
      break;

    case "medium":
      a = rand(10, 50);
      b = rand(5, 20);
      expr = `${a} * ${b}`;
      answer = a * b;
      time = 40000;
      break;

    case "hard":
      a = rand(20, 100);
      b = rand(2, 20);
      expr = `${a} / ${b}`;
      answer = a / b;
      time = 35000;
      break;

    case "impossible":
      a = rand(50, 150);
      b = rand(10, 50);
      c = rand(2, 10);
      expr = `${a} + ${b} * ${c}`;
      answer = a + b * c;
      time = 30000;
      break;

    case "impossible2":
      a = rand(50, 200);
      b = rand(5, 50);
      c = rand(2, 10);
      expr = `(${a} - ${b}) * ${c}`;
      answer = (a - b) * c;
      time = 25000;
      break;

    default:
      return null;
  }

  return { expr, answer, time };
}

module.exports = {
  name: "math",
  command: ["math"],
  tags: ["game"],
  usedCmd: [
    "math easy",
    "math medium",
    "math hard",
    "math impossible",
    "math impossible2",
  ],
  limit: true,

  async handler({ m, args, prefix, command }) {
    const mode = (args[0] || "").toLowerCase();
    const data = generateQuestion(mode);

    if (!data) {
      return m.reply(
        "🧮 *MATH GAME*\n\n" +
          "Mode:\n" +
          "• easy (45s)\n" +
          "• medium (40s)\n" +
          "• hard (35s)\n" +
          "• impossible (30s)\n" +
          "• impossible2 (25s)\n\n" +
          "Contoh:\n" +
          `${prefix}${command} hard`,
      );
    }

    const reward = getReward(mode);

    const sent = await m.reply(
      `🧠 *MATH ${mode.toUpperCase()}*\n\n` +
        `❓ ${data.expr} = ?\n\n` +
        `⏳ ${formatTime(data.time)}\n` +
        `❤️ Kesempatan: 3\n\n` +
        `🎁 Reward:\n` +
        `✨ EXP   : +${reward}\n` +
        `💰 Credit: +${reward}`,
    );

    global.REPLY_SESSIONS.set(m.sender, {
      plugin: "math",
      msgId: sent.key.id,
      answer: data.answer,
      tries: 3,
      expire: Date.now() + data.time,
      mode,
    });
  },

  async onReply({ m, session }) {
    if (!session) return;

    if (Date.now() > session.expire) {
      global.REPLY_SESSIONS.delete(m.sender);
      return m.reply("⏳ *Waktu habis!*");
    }

    const text =
      m.text ||
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      "";

    const userAnswer = Number(text.trim());
    if (isNaN(userAnswer)) return m.reply("❌ Jawaban harus angka");

    // BENAR
    if (userAnswer === session.answer) {
      global.REPLY_SESSIONS.delete(m.sender);

      const user = getUser(m.sender);
      const reward = getReward(session.mode);

      const levelUp = addExp(user, reward);
      addCredit(user, reward);

      let msg =
        `🎉 *BENAR!*\n\n` +
        `🧮 Mode   : ${session.mode.toUpperCase()}\n` +
        `✨ EXP    : +${reward}\n` +
        `💰 Credit : +${reward}`;

      if (levelUp) {
        msg += `\n\n🎊 *LEVEL UP!*\n⭐ Level sekarang: ${user.level}`;
      }

      return m.reply(msg);
    }

    // SALAH
    session.tries -= 1;

    if (session.tries <= 0) {
      global.REPLY_SESSIONS.delete(m.sender);
      return m.reply(
        `💀 *KESEMPATAN HABIS*\n` + `✔ Jawaban: ${session.answer}`,
      );
    }

    global.REPLY_SESSIONS.set(m.sender, session);

    return m.reply(`❌ *SALAH*\n` + `❤️ Sisa kesempatan: ${session.tries}`);
  },
};
