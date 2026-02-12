module.exports = {
  name: "getid",
  command: ["getid", "id"],
  tags: ["tools"],
  group: false,

  async handler({ m }) {
    const key = m.key || {}
    const ctx = m.message?.extendedTextMessage?.contextInfo || {}

    let lid = null
    let wa = null

    
    if (ctx.participant) {
      lid = ctx.participant
      wa =
        ctx.participantAlt ||
        (lid ? lid.replace("@lid", "@s.whatsapp.net") : null)
    }

    
    else if (ctx.mentionedJid?.length) {
      lid = ctx.mentionedJid[0]
      wa = lid.replace("@lid", "@s.whatsapp.net")
    }

    
    else {
      lid = key.participant || m.sender
      wa =
        key.participantAlt ||
        (lid ? lid.replace("@lid", "@s.whatsapp.net") : null)
    }

    let text = "🆔 *USER ID INFO*\n\n"
    text += `🔹 LID ID : ${lid || "-"}\n`
    text += `🔹 WA ID  : ${wa || "-"}\n`
    text += `🔹 CHAT   : ${m.chat}\n`

    return m.reply(text)
  }
}
