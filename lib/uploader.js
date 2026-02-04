let axios = require("axios")
let BodyForm = require("form-data")
let { fromBuffer } = require("file-type")
let fetch = require("node-fetch")
let fs = require("fs")
let cheerio = require("cheerio")

function TelegraPh(Path) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
    try {
      const form = new BodyForm()
      form.append("file", fs.createReadStream(Path))
      const data = await axios({
        url: "https://telegra.ph/upload",
        method: "POST",
        headers: { ...form.getHeaders() },
        data: form
      })
      resolve("https://telegra.ph" + data.data[0].src)
    } catch (e) {
      reject(e)
    }
  })
}

async function UploadFileUgu(input) {
  return new Promise(async (resolve, reject) => {
    const form = new BodyForm()
    form.append("files[]", fs.createReadStream(input))
    axios({
      url: "https://uguu.se/upload.php",
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        ...form.getHeaders()
      },
      data: form
    })
      .then(res => resolve(res.data.files[0].url))
      .catch(err => reject(err))
  })
}

function webp2mp4File(path) {
  return new Promise((resolve, reject) => {
    const form = new BodyForm()
    form.append("new-image-url", "")
    form.append("new-image", fs.createReadStream(path))
    axios({
      method: "post",
      url: "https://s6.ezgif.com/webp-to-mp4",
      data: form,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${form._boundary}`
      }
    }).then(({ data }) => {
      const $ = cheerio.load(data)
      const file = $('input[name="file"]').attr("value")
      const form2 = new BodyForm()
      form2.append("file", file)
      form2.append("convert", "Convert WebP to MP4!")
      axios({
        method: "post",
        url: "https://ezgif.com/webp-to-mp4/" + file,
        data: form2,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${form2._boundary}`
        }
      }).then(({ data }) => {
        const $ = cheerio.load(data)
        const result =
          "https:" +
          $("div#output > p.outfile > video > source").attr("src")
        resolve(result)
      })
    }).catch(reject)
  })
}

async function UploadFileCatbox(input) {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(input)) return reject("File not found")

    const form = new BodyForm()
    form.append("reqtype", "fileupload")
    form.append("fileToUpload", fs.createReadStream(input))

    try {
      const res = await axios.post(
        "https://catbox.moe/user/api.php",
        form,
        { headers: form.getHeaders() }
      )

      if (typeof res.data === "string" && res.data.startsWith("https://"))
        resolve(res.data)
      else reject("Invalid response")
    } catch (e) {
      reject(e)
    }
  })
}

async function floNime(medianya, options = {}) {
  const { ext } = (await fromBuffer(medianya)) || options.ext
  const form = new BodyForm()
  form.append("file", medianya, "tmp." + ext)
  const res = await fetch("https://flonime.my.id/upload", {
    method: "POST",
    body: form
  })
  return await res.json()
}

module.exports = {
  TelegraPh,
  UploadFileUgu,
  webp2mp4File,
  UploadFileCatbox,
  floNime
}
