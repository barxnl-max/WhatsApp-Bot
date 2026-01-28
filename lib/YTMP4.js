const fs = require("fs");
const path = require("path");
const ytdl = require("@distube/ytdl-core");
const TMP = path.join(__dirname, "../tmp");
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, {
  recursive: true
});
module.exports = async function YTMP4(url) {
  try {
    if (!ytdl.validateURL(url)) {
      return {
        status: false,
        error: "invalid youtube url"
      };
    }
    const info = await ytdl.getInfo(url);
    const v = info.videoDetails;
    const format = info.formats.find(f => f.container === "mp4" && f.hasVideo && f.hasAudio && f.qualityLabel === "360p");
    if (!format) {
      return {
        status: false,
        error: "360p not available"
      };
    }
    const safe = v.title.replace(/[^\w\d]/gi, "_").toLowerCase();
    const filename = path.join(TMP, safe + "_360p.mp4");
    await new Promise((resolve, reject) => {
      ytdl(url, {
        format,
        highWaterMark: 1 << 24
      }).pipe(fs.createWriteStream(filename)).on("finish", resolve).on("error", reject);
    });
    const buffer = await fs.promises.readFile(filename);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    fs.unlink(filename, () => {});
    return {
      status: true,
      title: v.title,
      channel: v.author?.name,
      duration: Number(v.lengthSeconds),
      views: Number(v.viewCount),
      thumbnail: v.thumbnails.at(-1)?.url,
      resolution: "360p",
      quality: format.qualityLabel,
      size: sizeMB + " MB",
      watermark: "Instagram @barxnl250_",
      buffer
    };
  } catch (e) {
    return {
      status: false,
      error: e.message
    };
  }
};