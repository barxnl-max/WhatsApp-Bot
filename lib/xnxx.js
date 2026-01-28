const fetch = require("node-fetch");
const cheerio = require("cheerio");
function match(regex, text) {
  return text.match(regex)?.[1] || null;
}
function detectResolution(url) {
  const m = url?.match(/video_(\d+)p\.mp4/);
  return m ? `${m[1]}p` : null;
}
async function getFileSize(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD"
    });
    const len = res.headers.get("content-length");
    if (!len) return null;
    return (Number(len) / 1024 / 1024).toFixed(2) + " MB";
  } catch {
    return null;
  }
}
async function parseHLSVariants(m3u8Url) {
  const res = await fetch(m3u8Url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36"
    }
  });
  const text = await res.text();
  const lines = text.split("\n");
  const variants = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
      const bandwidth = lines[i].match(/BANDWIDTH=(\d+)/)?.[1];
      const resolution = lines[i].match(/RESOLUTION=(\d+x\d+)/)?.[1];
      const url = lines[i + 1]?.trim();
      if (url) {
        const height = resolution?.split("x")[1];
        variants.push({
          resolution,
          quality: height ? `${height}p` : null,
          bandwidth: bandwidth ? Number(bandwidth) : null,
          url: url.startsWith("http") ? url : new URL(url, m3u8Url).href
        });
      }
    }
  }
  variants.sort((a, b) => (b.bandwidth || 0) - (a.bandwidth || 0));
  return variants;
}
async function xnxxdl(URL) {
  const res = await fetch(URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    }
  });
  const html = await res.text();
  const clean = html.replace(/\\\//g, "/");
  const $ = cheerio.load(html);
  const metaText = $("span.metadata").text().replace(/\n/g, "").trim();
  const lowUrl = match(/setVideoUrlLow\(["'](.*?)["']\)/, clean);
  const highUrl = match(/setVideoUrlHigh\(["'](.*?)["']\)/, clean);
  const hlsUrl = match(/setVideoHLS\(["'](.*?)["']\)/, clean);
  const files = {
    low: lowUrl ? {
      url: lowUrl,
      resolution: detectResolution(lowUrl),
      size: await getFileSize(lowUrl)
    } : null,
    high: highUrl ? {
      url: highUrl,
      resolution: detectResolution(highUrl),
      size: await getFileSize(highUrl)
    } : null,
    HLS: hlsUrl ? {
      url: hlsUrl,
      resolution: "adaptive",
      size: null
    } : null,
    thumb: match(/setThumbUrl\(["'](.*?)["']\)/, clean),
    thumb169: match(/setThumbUrl169\(["'](.*?)["']\)/, clean),
    thumbSlide: match(/setThumbSlide\(["'](.*?)["']\)/, clean),
    thumbSlideBig: match(/setThumbSlideBig\(["'](.*?)["']\)/, clean)
  };
  let resolutions = [];
  if (hlsUrl) resolutions = await parseHLSVariants(hlsUrl);
  const best = resolutions[0] || files.high || files.low || files.HLS || null;
  return {
    status: true,
    code: 200,
    result: {
      title: $('meta[property="og:title"]').attr("content") || null,
      URL,
      duration: metaText.split("-")[0]?.trim() || null,
      quality: metaText.split("-")[1]?.trim() || null,
      image: $('meta[property="og:image"]').attr("content") || null,
      best,
      files,
      resolutions
    }
  };
}
async function xnxxSearch(query, page = 1) {
  const base = "https://www.xnxx.com";
  const res = await fetch(`${base}/search/${encodeURIComponent(query)}/${page}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];
  $(".mozaique .thumb-block").each((_, el) => {
    const a = $(el).find("a");
    const link = base + a.attr("href")?.replace("/THUMBNUM/", "/") || null;
    const title = a.find(".title").text().trim() || a.attr("title") || a.text().trim() || null;
    const thumb = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || null;
    const info = $(el).find(".metadata").text().replace(/\n+/g, " ").trim();
    results.push({
      title,
      link,
      thumb,
      info
    });
  });
  return {
    status: true,
    code: 200,
    result: results
  };
}
module.exports = {
  xnxxdl,
  xnxxSearch
};