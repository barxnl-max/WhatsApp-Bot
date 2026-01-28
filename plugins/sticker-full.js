const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const settings = require("../settings");
const webp = require("node-webpmux");
const crypto = require("crypto");

module.exports = {
  name: "stickerfull",
  command: ["sfull", "stickerfull", "stikerfull"],
  usedCmd: ["stickerfull"],
  tags: ["sticker"],

  async handler({ m, sock }) {
    let target = m.quoted ? m.quoted : m;
    const mtype = target.mtype;

    if (!["imageMessage", "videoMessage", "documentMessage"].includes(mtype)) {
      return m.reply(
        "❌ Kirim / reply gambar, video, atau gif\n\n" +
          "Contoh:\n" +
          ".sfull\n" +
          ".stickerfull",
      );
    }

    try {
      const buffer = await downloadMediaMessage(
        target,
        "buffer",
        {},
        { reuploadRequest: sock.updateMediaMessage },
      );

      const tmp = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

      const input = path.join(tmp, `in_${Date.now()}`);
      const output = path.join(tmp, `out_${Date.now()}.webp`);
      fs.writeFileSync(input, buffer);

      const isAnimated =
        target.message?.videoMessage ||
        target.message?.imageMessage?.mimetype?.includes("gif");

      const duration = target.message?.videoMessage?.seconds || 0;
      if (isAnimated && duration > 9) {
        fs.unlinkSync(input);
        return m.reply("❌ Video maksimal 9 detik");
      }

      const cmd = isAnimated
        ? `ffmpeg -y -i "${input}" -t 9 -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=12,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -loop 0 -pix_fmt yuva420p -quality 35 -compression_level 6 -an "${output}"`
        : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -loop 0 -pix_fmt yuva420p -quality 65 -compression_level 6 "${output}"`;

      await new Promise((res, rej) =>
        exec(cmd, (err) => (err ? rej(err) : res())),
      );

      let webpBuf = fs.readFileSync(output);

      if (webpBuf.length > 900 * 1024) {
        const small = path.join(tmp, `small_${Date.now()}.webp`);
        const smallCmd = isAnimated
          ? `ffmpeg -y -i "${input}" -t 2 -vf "scale=384:384:force_original_aspect_ratio=decrease,fps=8,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -loop 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 80k "${small}"`
          : `ffmpeg -y -i "${input}" -vf "scale=384:384:force_original_aspect_ratio=decrease,format=rgba,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -loop 0 -pix_fmt yuva420p -quality 45 -compression_level 6 "${small}"`;

        await new Promise((res, rej) =>
          exec(smallCmd, (err) => (err ? rej(err) : res())),
        );

        if (fs.existsSync(small)) {
          webpBuf = fs.readFileSync(small);
          fs.unlinkSync(small);
        }
      }

      const img = new webp.Image();
      await img.load(webpBuf);

      const json = {
        "sticker-pack-id": crypto.randomBytes(16).toString("hex"),
        "sticker-pack-name": settings.packname || "CATA BOT",
        "sticker-pack-publisher": global.author || "BOT",
      };

      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);

      const jsonBuf = Buffer.from(JSON.stringify(json));
      const exif = Buffer.concat([exifAttr, jsonBuf]);
      exif.writeUIntLE(jsonBuf.length, 14, 4);
      img.exif = exif;

      await m.reply({ sticker: await img.save(null) });

      fs.unlinkSync(input);
      fs.unlinkSync(output);
    } catch (e) {
      console.error("[STICKERFULL ERROR]", e);
      m.reply("❌ Gagal membuat sticker full");
    }
  },
};
