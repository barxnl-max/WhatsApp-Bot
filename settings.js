const settings = {
  packname: "Catashtroph",
  author: "@barxnl250_",

  botName: "Cata Bot",
  botOwner: "Akbar",
  ownerNumber: "YOUR_NUMBER",
  ownerLid: "Your_Lid",

  giphyApiKey: "qnl7ssQChTdPjsKta2Ax2LMaGXz303tq",

  maxStoreMessages: 40,
  storeWriteInterval: 10000,

  description: "This is a bot for managing group commands and automating task.",
  version: "1.0.0",

  updateZipUrl: "https://github.com/barxnl-max/WhatsApp-Bot/archive/refs/heads/main.zip",
};

//isi ini jika deploy di Railway
global.botNumber= "Your Number Bot"
//prefix
global.prefix = [".", "!", "/", "#"];
global.noPrefix = false; // ✅ DEFAULT: bot TANPA prefix
global.blockedCommands = [];
// Wm Stickerr
global.packname = settings.packname;
global.author = settings.author;
global.wm = settings.packname;
global.auth = `Ig: ${settings.author.replace("@", "")}`;

global.groqAPI = "YOUR_KEY" //https://console.groq.com/keys
global.prompt = `Kamu adalah Lydia, AI cewek ceria buatan Akbar.`;

module.exports = settings;
