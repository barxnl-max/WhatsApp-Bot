module.exports = {
  name: "getid",
  command: ["getid", "id"],
  tags: ["tools"],
  group: false,

  async handler({ m }) {
    const key = m.key || {}

    const lid =
      key.participant ||
      m.sender ||
      null

    const wa =
      key.participantAlt ||
      (lid ? lid.replace("@lid", "@s.whatsapp.net") : null)

    let text = "🆔 *USER ID INFO*\n\n"

    text += `🔹 LID ID : ${lid || "-"}\n`
    text += `🔹 WA ID  : ${wa || "-"}\n`
    text += `🔹 CHAT   : ${m.chat}\n`

    return m.reply(text)
  }
}
