const axios = require("axios");
const FileType = require("file-type");

class Img2Anime {
  constructor() {
    this.API_URL = "https://aienhancer.ai/api/v1/r/image-enhance/create";
    this.RESULT_URL = "https://aienhancer.ai/api/v1/r/image-enhance/result";
    this.HEADERS = {
      "accept": "*/*",
      "content-type": "application/json",
      "Referer": "https://aienhancer.ai",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    };
    this.STYLE_PAYLOADS = {
      anime: "L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucENhHAkMq1EOilzosQlw2msQpW2yRqV3C/WqvP/jrmSu3aUVAyeFhSbK3ARzowBzQYPVHtxwBbTWwlSR4tehnodUasnmftnY77c8gIFtL2ArNdzmPLx5H8O9un2U8WE4s7O2FxvQPCjt2uGmHPMOx1DsNSnLvzCKPVdz8Ob1cPHePmmquQZlsb/p+8gGv+cizSiOL4ts6GD2RxWN+K5MmpA/F3rQXanFUm4EL0g7qZCQbChRRQyaAyZuxtIdTKsmsMzkVKM5Sx96eV7bEjUAJ52j6NcP96INv2DhnWTP7gB6tltFQe8B8SPS2LuLRuPghA==",
      manga: "L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucENhHAkMq1EOilzosQlw2msQpW2yRqV3C/WqvP/jrmSu3aUVAyeFhSbK3ARzowBzQYPVHtxwBbTWwlSR4tehnodUasnmftnY77c8gIFtL2ArNdzmPLx5H8O9un2U8WE4s0+xiFV3y4sbetHMN7rHh7DRIpuIQD4rKISR/vE+HeaHpRavXfsilr5P7Y6bsIo+RRFIPgX2ofbYYiATziqsjDeie4IlcOAVf1Pudqz8uk6YKM78CGxjF9iPLYQnkW+c6j96PNsg1Yk4Xz8/ZcdmHF4GGZe8ILYH/D0yyM1dsCkK1zY8ciL+6pAk4dHIZ/4k9A==",
      ghibli: "L7p91uXhVyp5OOJthAyqjSqhlbM+RPZ8+h2Uq9tz6Y+4Agarugz8f4JjxjEycxEzuj/7+6Q0YY9jUvrfmqkucENhHAkMq1EOilzosQlw2msQpW2yRqV3C/WqvP/jrmSu3aUVAyeFhSbK3ARzowBzQYPVHtxwBbTWwlSR4tehnodUasnmftnY77c8gIFtL2ArNdzmPLx5H8O9un2U8WE4syzL5EYHGJWC1rlQM9xhNe1PViOsBSxmwHVwOdqtxZtcAJmGuzTgG7JVU7Hr9ZRwajhYK5yxQwSdJGwwR4jjS1yF9s9wKUQqgI+fYxaw7FZziLS+9JG5pTEjch4D0fpl+LO7vIynHN4cyu4DDeAUwNeYfbGMn2QQs+5OgMdViCAM1GkJk2jhlQm10rESTjDryw=="
    };
    this.POLLING_INTERVAL = 2000;
    this.MAX_POLLING_ATTEMPTS = 120;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async createTask(imageBuffer, style) {
    const type = await FileType.fromBuffer(imageBuffer);
    if (!type) throw new Error("File type not recognized");

    const base64Img = imageBuffer.toString("base64");
    const dataUri = `data:${type.mime};base64,${base64Img}`;
    const settingsPayload = this.STYLE_PAYLOADS[style] || this.STYLE_PAYLOADS.anime;

    const payload = {
      model: 5,
      image: [dataUri],
      settings: settingsPayload,
      function: "photo-to-anime"
    };

    const { data } = await axios.post(this.API_URL, payload, { headers: this.HEADERS });

    if (data.code !== 100000 || !data.data.id) {
      throw new Error(data.message || "Failed create task");
    }
    return data.data.id;
  }

  async checkTask(taskId) {
    const { data } = await axios.post(this.RESULT_URL, {
      task_id: taskId
    }, { headers: this.HEADERS });
    return data;
  }

  async poll(taskId) {
    let attempts = 0;
    while (attempts < this.MAX_POLLING_ATTEMPTS) {
      const res = await this.checkTask(taskId);
      if (res.code !== 100000) throw new Error(res.message);
      const { status, output, error } = res.data;
      if (status === "succeeded" && output) return output;
      if (status === "failed" || error) throw new Error(error || "Task failed");
      await this.sleep(this.POLLING_INTERVAL);
      attempts++;
    }
    throw new Error("Timeout");
  }

  async generate(buffer, style) {
    const taskId = await this.createTask(buffer, style);
    return await this.poll(taskId);
  }
}

module.exports = {
  name: "img2anime",
  command: ["toanime", "img2anime"],
  tags: ["anime"],
  limit: true,

  async handler({ sock, m, args }) {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || "";

    if (!/image/.test(mime)) {
      return m.reply("❌ Reply gambar dengan:\n.toanime anime|manga|ghibli");
    }

    const style = ["anime", "manga", "ghibli"].includes(args[0]) ? args[0] : "anime";

    try {
      await m.react("⏳");
      const buffer = await q.download();

      const ai = new Img2Anime();
      const resultUrl = await ai.generate(buffer, style);

      await sock.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `✅ Style: ${style}`
      }, { quoted: m });
      await m.react("✅");
    } catch (e) {
      await m.react("❌");
      console.error(e);
      m.reply("❌ Gagal convert gambar\n\n" + (e.response?.data?.message || e.message));
    }
  }
};