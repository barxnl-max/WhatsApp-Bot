const fs = require("fs")
const path = require("path")

const GROUP_DB_PATH = path.join(process.cwd(), "data", "groups.json")

if (!global.db) global.db = {}
if (!global.db.groups) global.db.groups = {}

function loadGroupDB() {
  try {
    global.db.groups = JSON.parse(fs.readFileSync(GROUP_DB_PATH))
  } catch {
    global.db.groups = {}
  }
}

function saveGroupDB() {
  fs.writeFileSync(
    GROUP_DB_PATH,
    JSON.stringify(global.db.groups, null, 2)
  )
}

function getGroup(chatId) {
  if (!global.db.groups[chatId]) {
    global.db.groups[chatId] = {
      banned: {},
      settings: {},
      createdAt: Date.now()
    }
  }
  return global.db.groups[chatId]
}

loadGroupDB()
setInterval(saveGroupDB, 30_000)
process.on("exit", saveGroupDB)
process.on("SIGINT", saveGroupDB)
process.on("SIGTERM", saveGroupDB)

module.exports = {
  getGroup,
  saveGroupDB
}