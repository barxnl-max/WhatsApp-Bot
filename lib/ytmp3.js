const fs = require("fs");
const path = require("path");
const {
  spawn
} = require("child_process");
const ytdl = require("@distube/ytdl-core");
const TEMP_DIR = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, {
    recursive: true
  });
}
function cleanupPlayerScript(dir = process.cwd()) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith("-player-script.js") || file.includes("player-script")) {
        try {
          fs.unlinkSync(path.join(dir, file));
        } catch {}
      }
    }
  } catch {}
}
async function ytmp3(url) {
  let mp4Path;
  let mp3Path;
  try {
    if (!ytdl.validateURL(url)) {
      return {
        status: false,
        error: "invalid youtube url"
      };
    }
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const thumbnail = info.videoDetails.thumbnails.at(-1)?.url;
    const safe = title.replace(/[^\w\d]/gi, "_").toLowerCase();
    const stamp = Date.now();
    mp4Path = path.join(TEMP_DIR, `${safe}_${stamp}.mp4`);
    mp3Path = path.join(TEMP_DIR, `${safe}_${stamp}.mp3`);
    await new Promise((resolve, reject) => {
      ytdl(url, {
        quality: "18",
        highWaterMark: 1 << 20
      }).pipe(fs.createWriteStream(mp4Path)).on("finish", resolve).on("error", reject);
    });
    await new Promise((resolve, reject) => {
      const ff = spawn("ffmpeg", ["-y", "-i", mp4Path, "-vn", "-ab", "96k", "-ar", "44100", mp3Path]);
      ff.on("error", reject);
      ff.on("close", code => {
        code === 0 ? resolve() : reject(new Error("ffmpeg failed"));
      });
    });
    const buffer = await fs.promises.readFile(mp3Path);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    return {
      status: true,
      title,
      thumbnail,
      size: sizeMB + " MB",
      bitrate: "96kbps",
      buffer
    };
  } catch (e) {
    return {
      status: false,
      error: e.message
    };
  } finally {
    if (mp4Path && fs.existsSync(mp4Path)) {
      fs.unlink(mp4Path, () => {});
    }
    if (mp3Path && fs.existsSync(mp3Path)) {
      fs.unlink(mp3Path, () => {});
    }
    cleanupPlayerScript();
  }
}
module.exports = ytmp3;