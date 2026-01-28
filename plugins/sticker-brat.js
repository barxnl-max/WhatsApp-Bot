const fetch = require("node-fetch");
const fs = require("fs");
const { writeExifImg } = require("../lib/exif");
const settings = require("../settings");

module.exports = {
  name: "brat",
  command: ["brat", "sbrat"],
  usedCmd: "brat <text>",
  tags: ["sticker"],

  async handler({ m, sock, prefix }) {
    try {
      const text = (m.text || "")
        .replace(new RegExp(`^\\${prefix}(brat|sbrat)`, "i"), "")
        .trim();

      if (!text) {
        return m.reply(
          "⚠️ Masukkan teks\n\n" +
            "Contoh:\n" +
            `${prefix}brat Akbar\n` +
            `${prefix}sbrat Hello World`,
        );
      }

      const url = `https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch brat failed");

      const imgBuffer = Buffer.from(await res.arrayBuffer());

      const webpPath = await writeExifImg(imgBuffer, {
        packname: settings.packname,
        author: settings.author,
      });

      const sticker = fs.readFileSync(webpPath);
      fs.unlinkSync(webpPath);

      await m.reply({ sticker });
    } catch (err) {
      console.error("[BRAT ERROR]", err);
      m.reply("❌ Gagal bikin stiker brat");
    }
  },
};
