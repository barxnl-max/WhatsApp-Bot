const Groq = require("groq-sdk");
class Completion {
  constructor(user = "anonymous") {
    this.user = user;
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY || global.groqAPI
    });
    this.messages = [{
      role: "system",
      content: global.prompt3
    }];
  }
  async chat(text = "") {
    this.messages.push({
      role: "user",
      content: String(text)
    });
    const res = await this.client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: this.messages,
      temperature: 0.1,
      functions: [{
        name: "downloadMusic",
        description: "mengunduh lagu berdasarkan judul",
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
        description: "menutup grup (admin saja)",
        parameters: {
          type: "object",
          properties: {}
        }
      }, {
        name: "open_group",
        description: "membuka grup (admin saja)",
        parameters: {
          type: "object",
          properties: {}
        }
      }],
      function_call: "auto"
    });
    const msg = res.choices[0].message;
    this.messages.push(msg);
    if (msg.function_call) {
      return {
        function_call: {
          name: msg.function_call.name,
          arguments: JSON.parse(msg.function_call.arguments || "{}")
        }
      };
    }
    return {
      content: msg.content || ""
    };
  }
}
module.exports = Completion;