const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const commands = ["kiss", "slap", "pat", "hug", "bonk", "kick"];

module.exports = {
  name: "interaction",
  command: commands,
  usedCmd: commands.map(cmd => `${cmd} @user`),
  tags: ["fun"],

  async handler({ sock, m, chatId, command, args }) {
    let target = null;

    const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mention && mention.length > 0) {
      target = mention[0];
    } else if (m.quoted) {
      target = m.quoted.sender;
    } else {
      return m.reply(`❌ Tag user yang ingin kamu ${command}\nContoh: .${command} @user`);
    }

    if (target === m.sender) {
      return m.reply("❌ Tidak bisa berinteraksi dengan diri sendiri");
    }

    const api = `https://api.waifu.pics/sfw/${command}`;
    const res = await fetch(api);
    const json = await res.json();
    if (!json?.url) {
      return m.reply("❌ Gagal mengambil gambar dari API");
    }

    const mediaRes = await fetch(json.url);
    const buffer = Buffer.from(await mediaRes.arrayBuffer());
    const ext = json.url.split(".").pop().toLowerCase();

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const senderNumber = m.sender.split('@')[0];
    const targetNumber = target.split('@')[0];
    const caption = `@${senderNumber} ${command} @${targetNumber}`;
    const mentions = [m.sender, target];

    if (ext === "gif" || ext === "webp") {
      const input = path.join(tmpDir, `${Date.now()}.${ext}`);
      const output = path.join(tmpDir, `${Date.now()}.mp4`);
      fs.writeFileSync(input, buffer);

      try {
        await execPromise(`ffmpeg -i "${input}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -f mp4 "${output}"`);
        const videoBuffer = fs.readFileSync(output);
        fs.unlinkSync(input);
        fs.unlinkSync(output);

        await sock.sendMessage(chatId, {
          video: videoBuffer,
          gifPlayback: true,
          caption: caption,
          mentions: mentions
        }, { quoted: m });
      } catch (e) {
        console.error("Gagal konversi:", e);
        fs.unlinkSync(input);
        m.reply("❌ Gagal memproses media");
      }
    } else {
      await sock.sendMessage(chatId, {
        image: buffer,
        caption: caption,
        mentions: mentions
      }, { quoted: m });
    }
  }
};