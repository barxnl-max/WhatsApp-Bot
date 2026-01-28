const axios = require("axios");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
async function pinterest(url) {
  try {
    const ua = "mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/120 safari/537.36";
    const page = await axios.get(url, {
      headers: {
        "user-agent": ua,
        "accept-language": "en-us,en;q=0.9"
      },
      maxRedirects: 5
    });
    const $page = cheerio.load(page.data);
    const title = $page('meta[property="og:title"]').attr("content") || null;
    const thumb = $page('meta[property="og:image"]').attr("content") || null;
    const pageurl = $page('meta[property="og:url"]').attr("content") || url;
    const type = $page('meta[property="og:type"]').attr("content") || "";
    const body = "url=" + encodeURIComponent(pageurl);
    const res = await fetch("https://pinterestvideodownloader.com/en/", {
      method: "post",
      body: body,
      headers: {
        "user-agent": ua,
        "content-type": "application/x-www-form-urlencoded",
        origin: "https://pinterestvideodownloader.com",
        referer: "https://pinterestvideodownloader.com/en/"
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const downloads = [];
    const seen = {};
    $("a[href]").each(function () {
      const href = $(this).attr("href");
      if (typeof href !== "string") return;
      if (href.match(/\.mp4/i) || href.match(/v\.pinimg\.com/i)) {
        if (!seen[href]) {
          seen[href] = true;
          downloads.push({
            url: href
          });
        }
      }
    });
    return {
      status: true,
      creator: "instagram @barxnl250_",
      title: title,
      thumbnail: thumb,
      source: pageurl,
      type: type.match(/video/i) ? "video" : "image",
      downloads: downloads,
      count: downloads.length
    };
  } catch (e) {
    return {
      status: false,
      msg: "gagal mengambil data pinterest",
      error: e && e.message ? e.message : String(e)
    };
  }
}
module.exports = pinterest;