const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");
const GIFEncoder = require("gif-encoder-2");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { writeExifImg } = require("../lib/exif");

GlobalFonts.registerFromPath(
  path.join(__dirname, "../font/Marcellus-Regular.ttf"),
  "Marcellus",
);

module.exports = {
  name: "attp",
  command: ["attp"],
  usedCmd: "attp <text>",
  tags: ["sticker"],
  owner: false,
  admin: false,
  premium: false,
  group: false,
  private: false,

  async handler({ sock, m, chatId, args }) {
    const text = args.join(" ").trim();
    if (!text) {
      return m.reply("Contoh: attp halo dunia");
    }

    try {
      const gifPath = await renderGif(text);

      const webpPath = await writeExifImg(fs.readFileSync(gifPath), {
        packname: global.packname,
        author: global.author,
      });

      await sock.sendMessage(
        chatId,
        { sticker: fs.readFileSync(webpPath) },
        { quoted: m },
      );

      fs.unlinkSync(gifPath);
      fs.unlinkSync(webpPath);
    } catch (e) {
      console.error("ATTP ERROR:", e);
      m.reply("Gagal membuat ATTP");
    }
  },
};

async function renderGif(text) {
  const size = 512;
  const padding = 40;
  const maxWidth = size - padding * 2;

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const encoder = new GIFEncoder(size, size);
  const outPath = path.join(os.tmpdir(), `attp_${Date.now()}.gif`);

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(80);
  encoder.setTransparent(0x000000);

  let fontSize = 120;
  let lines = [];

  while (fontSize > 24) {
    ctx.font = `${fontSize}px Marcellus`;
    lines = wrapText(ctx, text, maxWidth);

    const lineHeight = fontSize * 1.3;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= size - padding * 2) break;
    fontSize -= 4;
  }

  const colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
  ];

  for (let i = 0; i < 20; i++) {
    ctx.clearRect(0, 0, size, size);

    ctx.font = `${fontSize}px Marcellus`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = colors[i % colors.length];
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = Math.max(3, fontSize / 18);

    const lineHeight = fontSize * 1.3;
    let y = size / 2 - ((lines.length - 1) * lineHeight) / 2;

    for (const line of lines) {
      ctx.strokeText(line, size / 2, y);
      ctx.fillText(line, size / 2, y);
      y += lineHeight;
    }

    encoder.addFrame(ctx);
  }

  encoder.finish();
  fs.writeFileSync(outPath, encoder.out.getData());
  return outPath;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const width = ctx.measureText(test).width;

    if (width > maxWidth) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);
  return lines;
}
