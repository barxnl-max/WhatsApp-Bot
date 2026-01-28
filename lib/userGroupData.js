const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../data/userGroupData.json");
function loadUserGroupData() {
  try {
    return JSON.parse(fs.readFileSync(FILE));
  } catch {
    return {
      chatbot: {}
    };
  }
}
function saveUserGroupData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}
module.exports = {
  loadUserGroupData,
  saveUserGroupData
};