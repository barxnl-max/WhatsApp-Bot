const OpenAI = require("openai");
const moment = require("moment-timezone");
class Completion {
  constructor(user = "anonymous") {
    this.user = user;
    this.client = new OpenAI({
      apiKey: process.env.API_KEY || global.API_KEY || "sk-VzZYaCSKHivonJ4NMYdRHakkuB7nyPb5ECSoKGpP7xMas3pW",
      baseURL: "https://api.chatanywhere.tech/v1"
    });
    this.messages = [{
      role: "system",
      content: "Nama kamu Lydia, AI buatan Akbar, anda menggunakan aksen bahasa indonesia informal"
    }];
  }
  async chat(text = "") {
    if (global.prompt3) {
      this.messages.push({
        role: "user",
        content: `Nama kamu Lydia, wanita manja, lucu, banyak expresi dan kamu menggunakan aksen indonesia informal(Jaksel), Dan yang menciptakan kamu Akbar, Intro
nama: lydia
umur: 18 tahun
gender: wanita
askot: dari server`
      });
    }
    this.messages.push({
      role: "user",
      content: String(text)
    });
    const res = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: this.messages,
      temperature: 0.6,
      functions: [{
        name: "downloadMusic",
        description: "mendownload lagu berdasarkan judul lagu",
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string"
            }
          },
          required: ["title"]
        }
      }, {
        name: "close_group",
        description: "menutup grup (hanya admin)",
        parameters: {
          type: "object",
          properties: {}
        }
      }, {
        name: "open_group",
        description: "membuka grup (hanya admin)",
        parameters: {
          type: "object",
          properties: {}
        }
      }],
      function_call: "auto"
    });
    const choice = res.choices[0];
    const msg = choice.message;
    if (msg) this.messages.push(msg);
    if (msg?.function_call) {
      return {
        function_call: {
          name: msg.function_call.name,
          arguments: JSON.parse(msg.function_call.arguments || "{}")
        }
      };
    }
    return {
      content: msg?.content || ""
    };
  }
}
module.exports = Completion;