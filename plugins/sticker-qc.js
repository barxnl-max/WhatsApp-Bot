const axios = require("axios");
const fs = require("fs");
const { writeExifImg } = require("../lib/exif");
const settings = require("../settings");

const COLORS = {
  white: "#ffffff",
  black: "#000000",
  red: "#f44336",
  blue: "#6cace4",
  green: "#4caf50",
  yellow: "#ffeb3b",
  purple: "#9c27b0",
  pink: "#f68ac9",
  orange: "#ff9800",
  teal: "#008080",
  magenta: "#ff00ff",
  gold: "#ffd700",
  silver: "#c0c0c0",
};

module.exports = {
  name: "qc",
  command: ["qc"],
  usedCmd: "qc <text / reply>",
  tags: ["sticker"],

  async handler({ m, sock, prefix }) {
    try {
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      const targetJid =
        ctx?.participant || m.key.participant || m.key.remoteJid;

      let targetName = "User";
      try {
        targetName = await sock.getName(targetJid);
      } catch {}

      let avatar;
      try {
        avatar = await sock.profilePictureUrl(targetJid, "image");
      } catch {
        avatar = "https://i.ibb.co.com/twJ7HCJ0/avatar-contact.png";
      }

      let text = "";

      if (ctx?.quotedMessage?.conversation) {
        text = ctx.quotedMessage.conversation;
      } else {
        text = (m.text || "")
          .replace(new RegExp(`^\\${prefix}qc`, "i"), "")
          .trim();
      }

      if (!text) {
        return m.reply(
          "❌ Masukkan teks atau reply pesan\n\n" +
            `Contoh:\n${prefix}qc halo dunia\n${prefix}qc red halo`,
        );
      }

      if (text.length > 80) {
        return m.reply("❌ Maksimal 80 karakter");
      }

      let color = "white";
      const words = text.split(" ");

      if (COLORS[words[0]?.toLowerCase()]) {
        color = words.shift().toLowerCase();
        text = words.join(" ");
      }

      const payload = {
        type: "quote",
        format: "png",
        backgroundColor: COLORS[color],
        width: 512,
        height: 768,
        scale: 2,
        messages: [
          {
            entities: [],
            avatar: true,
            from: {
              id: 1,
              name: targetName,
              photo: { url: avatar },
            },
            text,
            replyMessage: {},
          },
        ],
      };

      const res = await axios.post(
        "https://bot.lyo.su/quote/generate",
        payload,
        { headers: { "Content-Type": "application/json" } },
      );

      const imgBuffer = Buffer.from(res.data.result.image, "base64");

      const webpPath = await writeExifImg(imgBuffer, {
        packname: targetName,
        author: settings.author,
      });

      const sticker = fs.readFileSync(webpPath);
      fs.unlinkSync(webpPath);

      await m.reply({ sticker });
    } catch (e) {
      console.error("[QC ERROR]", e);
      m.reply("❌ Gagal membuat QC sticker");
    }
  },
};
