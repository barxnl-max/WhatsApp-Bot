const { Groq } = require("groq-sdk")

global.AI_SESSIONS = global.AI_SESSIONS || new Map()

module.exports = {
  name: "ai",
  command: ["ai"],
  tags: ["ai"],
  limit: true,

  async handler({ m }) {
    const raw = (m.text || "").replace(/^\.ai\s*/i, "").trim()
    if (!raw) return m.reply("❌ Masukkan pertanyaan")

    const sender = m.sender

    if (raw.toLowerCase() === "reset") {
      global.AI_SESSIONS.delete(sender)
      return m.reply("✅ Sesi AI kamu sudah di-reset")
    }

    if (!global.groqAPI) {
      return m.reply("❌ API Groq belum diset")
    }

    const groq = new Groq({ apiKey: global.groqAPI })

    let history = global.AI_SESSIONS.get(sender)
    if (!history) {
      history = [
        {
          role: "system",
          content: global.prompt
        }
      ]
    }

    history.push({
      role: "user",
      content: raw
    })

    history = history.slice(-12)

    let answer = ""

    try {
      const completion = await groq.chat.completions.create({
        model: "groq/compound",
        stream: true,
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        messages: history,
        compound_custom: {
          tools: {
            enabled_tools: [
              "web_search",
              "visit_website",
              "code_interpreter"
            ]
          }
        }
      })

      for await (const chunk of completion) {
        const delta = chunk.choices?.[0]?.delta?.content
        if (delta) answer += delta
      }

      if (!answer.trim()) {
        return m.reply("❌ AI tidak menghasilkan jawaban")
      }

      history.push({
        role: "assistant",
        content: answer
      })

      global.AI_SESSIONS.set(sender, history.slice(-12))

      return m.reply(answer)

    } catch (e) {
      console.error("AI ERROR:", e)
      return m.reply("❌ Terjadi error saat memproses AI")
    }
  }
}

