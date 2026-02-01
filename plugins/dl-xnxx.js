const fetch = require("node-fetch");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { xnxxSearch, xnxxdl } = require("../lib/xnxx");

const SIZE_LIMIT = 199 * 1024 * 1024;
if (!global.REPLY_SESSIONS) global.REPLY_SESSIONS = new Map();

function collectResolutions(result) {
  const map = new Map();

  if (result.files?.high?.url)
    map.set(result.files.high.resolution, result.files.high.url);

  if (result.files?.low?.url)
    map.set(result.files.low.resolution, result.files.low.url);

  if (Array.isArray(result.resolutions)) {
    for (const r of result.resolutions) {
      if (r.quality && r.url && !map.has(r.quality)) {
        map.set(r.quality, r.url);
      }
    }
  }

  return [...map.entries()]
    .map(([label, url]) => ({ label, url }))
    .sort((a, b) => parseInt(b.label) - parseInt(a.label));
}

function pickAutoResolution(list) {
  const priority = ["480p", "360p", "250p", "240p"];
  for (const p of priority) {
    const f = list.find((v) => v.label === p);
    if (f) return f;
  }
  return list[list.length - 1] || null;
}

async function sendVideo(sock, m, file, meta) {
  if (!file) return m.reply("❌ Video tidak tersedia");

  const isHLS = file.url.includes(".m3u8");
  let asDocument = false;

  if (!isHLS) {
    try {
      const head = await fetch(file.url, { method: "HEAD" });
      const len = head.headers.get("content-length");
      if (len && Number(len) > SIZE_LIMIT) asDocument = true;
    } catch {}
  }

  const all = collectResolutions(meta);
  const other = all
    .filter((v) => v.label !== file.label)
    .map((v) => `• ${v.label}\n${v.url}`)
    .join("\n\n");

  const caption = `🎬 *${meta.title}*
⏱️ Durasi : ${meta.duration || "-"}
📺 Resolusi : ${file.label}

📚 Resolusi lain:
${other || "-"}`;

  await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  if (isHLS) {
    const out = path.join("./temp", `xnxx_${Date.now()}.mp4`);

    await new Promise((resolve, reject) => {
      const ff = spawn("ffmpeg", [
        "-y",
        "-loglevel",
        "error",
        "-i",
        file.url,
        "-c",
        "copy",
        "-bsf:a",
        "aac_adtstoasc",
        out,
      ]);
      ff.on("close", (code) => (code === 0 ? resolve() : reject()));
    });

    const size = fs.statSync(out).size;

    await sock.sendFile(m.chat, out, {
      quoted: m,
      asDocument: size > SIZE_LIMIT,
      fileName: `${meta.title}.mp4`,
      caption,
    });

    try {
      fs.unlinkSync(out);
    } catch {}
  } else {
    await sock.sendFile(m.chat, file.url, {
      quoted: m,
      asDocument,
      fileName: `${meta.title}.mp4`,
      caption,
    });
  }

  await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
}

module.exports = {
  name: "xnxx",
  command: ["xnxx"],
  tags: ["nsfw"],
  nsfw: true,
  premium: true,
  usedCmd: ["xnxx <query / url>"],

  async handler({ m, sock, args, prefix }) {
    const text = args.join(" ").trim();
    if (!text)
      return m.reply(
        `📌 *XNXX Downloader*

🔍 Cari:
${prefix}xnxx <query>

🔗 Download URL:
${prefix}xnxx <url>

📥 Reply hasil:
getvideo / getvideo 2`,
      );

    if (/^https?:\/\//i.test(text)) {
      const dl = await xnxxdl(text);
      if (!dl?.result) return m.reply("❌ Gagal mengambil video");

      const all = collectResolutions(dl.result);
      const file = pickAutoResolution(all);
      return sendVideo(sock, m, file, dl.result);
    }

    const res = await xnxxSearch(text);
    if (!res?.result?.length) return m.reply("❌ Tidak ada hasil");

    const list = res.result.slice(0, 10);

    let msg = "🔎 *Hasil XNXX*\n\n";
    list.forEach((v, i) => {
      msg += `*${i + 1}.* ${v.title}\n`;
    });

    msg += "\n📥 Reply:\ngetvideo / getvideo 2";

    const sent = await m.reply(msg);

    global.REPLY_SESSIONS.set(m.sender, {
      plugin: "xnxx",
      msgId: sent.key.id,
      data: list,
      expire: Date.now() + 2 * 60 * 1000,
    });
  },

  async onReply({ sock, m, session }) {
    if (!session || session.plugin !== "xnxx") return;
    if (!m.text) return;

    if (Date.now() > session.expire) {
      global.REPLY_SESSIONS.delete(m.sender);
      return m.reply("⏳ Sesi habis");
    }

    const text = m.text.trim().toLowerCase();
    if (!text.startsWith("getvideo")) return;

    const num = text.replace("getvideo", "").trim();
    const index = num ? Number(num) - 1 : 0;

    if (isNaN(index) || index < 0)
      return m.reply("❌ Format salah\nContoh: getvideo / getvideo 2");

    const item = session.data[index];
    if (!item) return m.reply("❌ Nomor tidak tersedia");

    const dl = await xnxxdl(item.link);
    if (!dl?.result) return m.reply("❌ Gagal mengambil video");

    const all = collectResolutions(dl.result);
    const file = pickAutoResolution(all);

    await sendVideo(sock, m, file, dl.result);
    global.REPLY_SESSIONS.delete(m.sender);
  },
};
