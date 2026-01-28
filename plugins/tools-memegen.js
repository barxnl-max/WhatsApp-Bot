const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { writeExifImg } = require("../lib/exif");
const { UploadFileUgu, TelegraPh } = require("../lib/uploader");
const settings = require("../settings");

async function downloadQuotedMedia(m) {
  const ctx = m.message?.extendedTextMessage?.contextInfo;
  const quoted = ctx?.quotedMessage;
  if (!quoted) return null;

  let stream;
  if (quoted.imageMessage) {
    stream = await downloadContentFromMessage(quoted.imageMessage, "image");
  } else if (quoted.stickerMessage) {
    stream = await downloadContentFromMessage(quoted.stickerMessage, "sticker");
  } else {
    return null;
  }

  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
}

async function uploadImage(buffer) {
  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const tmpPath = path.join(tmpDir, `${Date.now()}.jpg`);
  fs.writeFileSync(tmpPath, buffer);

  let url;
  try {
    url = await TelegraPh(tmpPath);
  } catch {
    const res = await UploadFileUgu(tmpPath);
    url = typeof res === "string" ? res : res.url;
  }

  setTimeout(() => {
    try {
      fs.unlinkSync(tmpPath);
    } catch {}
  }, 2000);

  return url;
}

module.exports = {
  name: "memegen",
  command: ["memegen", "meme", "smeme"],
  usedCmd: ["memegen <text|text>"],
  tags: ["sticker", "tools"],

  async handler({ m, sock, prefix }) {
    try {
      const buffer = await downloadQuotedMedia(m);
      if (!buffer) {
        return m.reply(
          "⚠️ Reply gambar atau stiker (non gif)\n\n" +
            "Format:\n" +
            `${prefix}memegen atas | bawah\n` +
            `${prefix}memegen atas | bawah --image`,
        );
      }

      const text = (m.text || "")
        .replace(new RegExp(`^\\${prefix}(memegen|meme)`, "i"), "")
        .trim();

      const isImage = text.includes("--image");
      const clean = text.replace("--image", "").trim();

      let [top = "", bottom = ""] = clean.split("|");
      top = encodeURIComponent(top || "_");
      bottom = encodeURIComponent(bottom || "_");

      const bgUrl = await uploadImage(buffer);

      const memeUrl =
        `https://api.memegen.link/images/custom/${top}/${bottom}.png` +
        `?background=${encodeURIComponent(bgUrl)}`;

      if (isImage) {
        return await sock.sendMessage(
          m.chat,
          {
            image: { url: memeUrl },
            caption: "🖼️ Meme Generated",
          },
          { quoted: m },
        );
      }

      const img = await axios.get(memeUrl, {
        responseType: "arraybuffer",
      });

      const webpPath = await writeExifImg(img.data, {
        packname: settings.packname,
        author: settings.author,
      });

      const sticker = fs.readFileSync(webpPath);
      fs.unlinkSync(webpPath);

      await m.reply({ sticker });
    } catch (e) {
      console.error("[MEMEGEN ERROR]", e);
      m.reply("❌ Gagal membuat meme");
    }
  },
};
