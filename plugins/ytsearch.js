const yts = require("yt-search");
const ytmp3 = require("../lib/ytmp3");

if (!global.REPLY_SESSIONS) global.REPLY_SESSIONS = new Map();

function formatDuration(sec) {
  sec = Number(sec || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return [
    h ? String(h).padStart(2, "0") : null,
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ]
    .filter(Boolean)
    .join(":");
}

function formatViews(num) {
  return Number(num || 0).toLocaleString("id-ID");
}

module.exports = {
  name: "ytsearch",
  command: ["ytsearch", "yts"],
  tags: ["downloader"],
  premium: false,
  usedCmd: ["ytsearch <query>"],

  async handler({ m, sock, args, prefix }) {
    const query = args.join(" ").trim();
    if (!query) {
      return m.reply(
        `🎵 *YouTube Search*

${prefix}ytsearch <judul lagu>

📥 Download audio:
Reply hasil →
getaudio
getaudio 2
getaudio 2 6 7`,
      );
    }

    await sock.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

    const res = await yts(query);
    if (!res.videos?.length) {
      await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("❌ Lagu tidak ditemukan");
    }

    const list = res.videos.slice(0, 10);

    let msg = "🎧 *Hasil Pencarian YouTube*\n\n";
    list.forEach((v, i) => {
      msg += `*${i + 1}.* ${v.title}
⏱ ${formatDuration(v.seconds)}
👁 ${formatViews(v.views)}
👤 ${v.author.name}\n\n`;
    });

    msg += `📥 *Reply pesan ini:*
getaudio
getaudio 2
getaudio 2 6 7`;

    const sent = await m.reply(msg);

    global.REPLY_SESSIONS.set(m.sender, {
      plugin: "ytsearch",
      msgId: sent.key.id,
      data: list,
      expire: Date.now() + 2 * 60 * 1000,
    });
  },

  async onReply({ m, sock, session }) {
    if (!session || session.plugin !== "ytsearch") return;
    if (!m.text) return;

    if (Date.now() > session.expire) {
      global.REPLY_SESSIONS.delete(m.sender);
      return m.reply("⏳ Sesi habis, silakan cari ulang");
    }

    if (!m.quoted || m.quoted.key.id !== session.msgId) return;

    const text = m.text.trim().toLowerCase();
    if (!text.startsWith("getaudio")) return;

    const nums = text
      .replace("getaudio", "")
      .trim()
      .split(/\s+/)
      .filter((v) => /^\d+$/.test(v))
      .map((v) => Number(v) - 1);

    const indexes = nums.length ? nums : [0];

    for (const i of indexes) {
      const item = session.data[i];
      if (!item) continue;

      try {
        await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const res = await ytmp3(item.url);
        if (!res?.status) {
          await m.reply(`❌ Gagal download: ${item.title}`);
          continue;
        }

        const caption = `🎵 *${item.title}*

👤 Channel : ${item.author.name}
⏱ Duration : ${formatDuration(item.seconds)}
👁 Views    : ${formatViews(item.views)}
📅 Upload   : ${item.ago}
🎧 Bitrate  : ${res.bitrate}
📦 Size     : ${res.size}
🔗 URL      : ${item.url}`;

        await sock.sendMessage(
          m.chat,
          {
            image: { url: res.thumbnail },
            caption,
          },
          { quoted: m },
        );

        await sock.sendMessage(
          m.chat,
          {
            audio: res.buffer,
            mimetype: "audio/mpeg",
            fileName: item.title.replace(/[^\w\d]/gi, "_") + ".mp3",
          },
          { quoted: m },
        );
      } catch (e) {
        console.error("getaudio error:", e);
        await m.reply("❌ Terjadi kesalahan saat download audio");
      }
    }

    await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    global.REPLY_SESSIONS.delete(m.sender);
  },
};
