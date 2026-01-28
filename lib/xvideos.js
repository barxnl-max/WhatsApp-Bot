const {
  fetch
} = require("undici");
const cheerio = require("cheerio");
class Xvideos {
  search = async function search(q) {
    try {
      const page = Math.floor(3 * Math.random()) + 1;
      const resp = await fetch(`https://www.xvideos.com/?k=${q}&p=${page}`);
      const $ = cheerio.load(await resp.text());
      const res = [];
      $('div[id*="video"]').each((_, bkp) => {
        const title = $(bkp).find(".thumb-under p.title a").contents().not("span").text().trim();
        const resolution = $(bkp).find(".thumb-inside .thumb span").text().trim();
        const duration = $(bkp).find(".thumb-under p.metadata span.duration").text().trim();
        const artist = $(bkp).find(".thumb-under p.metadata a span.name").text().trim();
        const imageUrl = $(bkp).find(".thumb-inside .thumb img").attr("data-src");
        const link = $(bkp).find(".thumb-inside .thumb a").attr("href");
        res.push({
          title,
          resolution,
          duration,
          artist,
          imageUrl,
          link: "https://www.xvideos.com" + link
        });
      });
      return res;
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      return error.message;
    }
  };
  download = async function download(url) {
    try {
      const resp = await fetch(url);
      const $ = cheerio.load(await resp.text());
      const scriptContent = $("#video-player-bg > script:nth-child(6)").html();
      const extractData = regex => (scriptContent.match(regex) || [])[1];
      const videos = {
        low: extractData(/html5player\.setVideoUrlLow\('(.*?)'\);/),
        high: extractData(/html5player\.setVideoUrlHigh\('(.*?)'\);/),
        HLS: extractData(/html5player\.setVideoHLS\('(.*?)'\);/)
      };
      const thumbnail = {
        thumb: extractData(/html5player\.setThumbUrl\('(.*?)'\);/),
        thumb69: extractData(/html5player\.setThumbUrl169\('(.*?)'\);/),
        thumbSlide: extractData(/html5player\.setThumbSlide\('(.*?)'\);/),
        thumbSlideBig: extractData(/html5player\.setThumbSlideBig\('(.*?)'\);/)
      };
      return {
        videos,
        thumbnail
      };
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      return error.message;
    }
  };
}
module.exports = new Xvideos();