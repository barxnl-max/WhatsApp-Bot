const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const {
  JSDOM
} = require("jsdom");
class EzGif {
  static async WebP2mp4(filePath) {
    const form = new FormData();
    form.append("new-image-url", "");
    form.append("new-image", fs.createReadStream(filePath));
    const uploadRes = await axios.post("https://ezgif.com/webp-to-mp4", form, {
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html"
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    const uploadDom = new JSDOM(uploadRes.data).window.document;
    const file = uploadDom.querySelector('input[name="file"]')?.value;
    const convert = uploadDom.querySelector('input[name="convert"]')?.value;
    if (!file || !convert) {
      throw new Error("Upload failed");
    }
    const form2 = new FormData();
    form2.append("file", file);
    form2.append("convert", convert);
    const convertRes = await axios.post(`https://ezgif.com/webp-to-mp4/${file}`, form2, {
      headers: {
        ...form2.getHeaders(),
        "User-Agent": "Mozilla/5.0",
        Accept: "text/html"
      }
    });
    const convertDom = new JSDOM(convertRes.data).window.document;
    const src = convertDom.querySelector("video > source")?.getAttribute("src") || convertDom.querySelector('a[href$=".mp4"]')?.getAttribute("href");
    if (!src) {
      throw new Error("Convert failed");
    }
    return src.startsWith("http") ? src : `https:${src}`;
  }
}
module.exports = EzGif;