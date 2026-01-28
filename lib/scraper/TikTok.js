const axios = require("axios");
function isArray(v) {
  return Object.prototype.toString.call(v) === "[object Array]";
}
function fixUrl(u) {
  if (!u) return null;
  if (u.startsWith("http")) return u;
  return "https://tikwm.com" + u;
}
async function tiktokSearch(keyword, limit = 5) {
  const payload = new URLSearchParams({
    keywords: keyword,
    count: limit,
    cursor: 0,
    HD: 1
  });
  const {
    data
  } = await axios.post("https://tikwm.com/api/feed/search", payload.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0",
      Cookie: "current_language=en"
    }
  });
  const videos = data && data.data && data.data.videos;
  if (!isArray(videos)) return [];
  return videos.map(v => ({
    id: v.video_id,
    title: v.title || "No title",
    author: v.author && v.author.nickname,
    link: "https://www.tiktok.com/@" + v.author.unique_id + "/video/" + v.video_id,
    duration: v.duration
  }));
}
async function tiktokDownload(url) {
  const payload = new URLSearchParams({
    url
  });
  const {
    data
  } = await axios.post("https://tikwm.com/api/", payload.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0"
    }
  });
  const d = data && data.data;
  if (!d) return null;
  const result = {
    id: d.id,
    title: d.title || "No title",
    caption: d.title || "",
    author: {
      id: d.author && d.author.id,
      unique_id: d.author && d.author.unique_id,
      nickname: d.author && d.author.nickname,
      avatar: fixUrl(d.author && d.author.avatar)
    },
    music: fixUrl(d.music)
  };
  if (isArray(d.images) && d.images.length) {
    result.type = "slide";
    result.images = d.images.map(fixUrl);
    return result;
  }
  result.type = "video";
  result.hd = fixUrl(d.hdplay) || fixUrl(d.play);
  result.no_wm = fixUrl(d.play);
  result.wm = fixUrl(d.wmplay);
  return result;
}
module.exports = {
  tiktokSearch,
  tiktokDownload
};