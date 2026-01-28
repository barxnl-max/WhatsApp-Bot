const fetch = require("node-fetch");
const FormData = require("form-data");
const apiKey = global.groqApi;
const apiUrl = "https://api.groq.com/openai/v1/audio/transcriptions";
const md5 = require("md5");
const filetype = require("file-type");
async function createTranscription(file) {
  let {
    ext,
    mime
  } = await filetype.fromBuffer(file);
  const formData = new FormData();
  formData.append("file", file, {
    filename: `${await md5(file)}.${ext}`,
    contentType: mime
  });
  formData.append("model", "whisper-large-v3-turbo");
  formData.append("response_format", "json");
  formData.append("language", "id");
  const response = await fetch(apiUrl, {
    method: "post",
    body: formData,
    headers: {
      ...formData.getHeaders(),
      Authorization: `Bearer ${apiKey}`
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
module.exports = createTranscription;