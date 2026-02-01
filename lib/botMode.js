const fs = require("fs")
const path = require("path")

const MODE_PATH = path.join(process.cwd(), "data/messageCount.json")

function readData() {
  try {
    return JSON.parse(fs.readFileSync(MODE_PATH))
  } catch {
    return {}
  }
}

function writeData(data) {
  fs.writeFileSync(MODE_PATH, JSON.stringify(data, null, 2))
}

/* ======================
        BOT MODE
====================== */
function getBotMode() {
  const data = readData()
  return data.mode || "public"
}

function setBotMode(mode) {
  const data = readData()
  data.mode = mode
  writeData(data)
}

function getTesterList() {
  const data = readData()
  return Array.isArray(data.testers) ? data.testers : []
}

function addTester(jid) {
  const data = readData()
  if (!Array.isArray(data.testers)) data.testers = []
  if (!data.testers.includes(jid)) data.testers.push(jid)
  writeData(data)
}

function removeTester(jid) {
  const data = readData()
  if (!Array.isArray(data.testers)) return
  data.testers = data.testers.filter(j => j !== jid)
  writeData(data)
}

function isTester(jid) {
  const data = readData()
  return Array.isArray(data.testers) && data.testers.includes(jid)
}

function allowByMode({ mode, isGroup, isOwner, isTester }) {
  if (isOwner || isTester) return true

  switch (mode) {
    case "self":
      return false
    case "private":
      return !isGroup
    case "group":
      return isGroup
    case "private_group":
      return true
    case "public":
    default:
      return true
  }
}

module.exports = {
  getBotMode,
  setBotMode,
  getTesterList,
  addTester,
  removeTester,
  isTester,
  allowByMode,
}
