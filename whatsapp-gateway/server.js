const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || 'route233-gateway-secret-key';

app.use(express.json());

let sock;
let connectionStatus = 'initializing';
let latestQr = null;

// Start Baileys WhatsApp Connection
async function connectToWhatsApp() {
  console.log('Starting WhatsApp Gateway connection...');
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_info_baileys'));

  // Fetch the latest WhatsApp Web version dynamically to prevent 405 errors
  let version = [2, 3000, 1017531287]; // Stable fallback version
  let isLatest = false;
  try {
    const latest = await fetchLatestBaileysVersion();
    version = latest.version;
    isLatest = latest.isLatest;
    console.log(`Successfully fetched latest WhatsApp version: ${version.join('.')}, isLatest: ${isLatest}`);
  } catch (err) {
    console.warn('Failed to fetch latest WhatsApp version dynamically, using stable fallback:', err.message);
  }

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false, // We will custom print it with qrcode-terminal
    logger: pino({ level: 'silent' }), // Keep logs clean
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n--- SCAN THIS QR CODE WITH YOUR WHATSAPP (Settings > Linked Devices) ---\n');
      qrcode.generate(qr, { small: true });
      console.log('\n----------------------------------------------------------------------\n');
      latestQr = qr;
      connectionStatus = 'awaiting_qr_scan';
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('WhatsApp connection closed due to:', lastDisconnect?.error || 'Unknown Error', '. Reconnecting:', shouldReconnect);
      connectionStatus = 'disconnected';
      latestQr = null;
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('🚀 WhatsApp Gateway is CONNECTED and READY!');
      connectionStatus = 'connected';
      latestQr = null;
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// REST API Endpoints

// Middleware to authenticate requests using API Key
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.body.key;
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key.' });
  }
  next();
}

// Endpoint to view the perfect QR code in the browser
app.get('/qr', (req, res) => {
  if (connectionStatus === 'connected') {
    return res.send(`
      <html>
        <body style="background-color: #121212; color: #4ade80; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center;">
            <h2>🚀 WhatsApp Gateway is already CONNECTED and READY!</h2>
            <p style="color: #a3a3a3;">You do not need to scan a QR code.</p>
          </div>
        </body>
      </html>
    `);
  }

  if (!latestQr) {
    return res.send(`
      <html>
        <body style="background-color: #121212; color: #ffffff; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center;">
            <h2>Generating QR code...</h2>
            <p style="color: #a3a3a3;">Please wait a moment and refresh this page.</p>
          </div>
        </body>
      </html>
    `);
  }

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(latestQr)}`;

  res.send(`
    <html>
      <head>
        <title>Scan WhatsApp QR Code</title>
        <style>
          body {
            background-color: #121212;
            color: #ffffff;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background-color: #1e1e1e;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
            text-align: center;
            max-width: 400px;
          }
          img {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 8px;
            margin: 25px 0;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 style="margin-top: 0; color: #4ade80;">Route233 WhatsApp</h2>
          <p style="color: #d4d4d4; font-size: 15px; line-height: 1.5;">Scan this QR code with your WhatsApp app<br>(Settings > Linked Devices)</p>
          <img src="${qrImageUrl}" alt="WhatsApp QR Code" />
          <p style="color: #a3a3a3; font-size: 13px;">Refreshing this page will fetch a fresh code if this one expires.</p>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    whatsapp: connectionStatus,
    timestamp: new Date().toISOString()
  });
});

// Endpoint to send a WhatsApp message
app.post('/send', authenticate, async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing parameter: "to" and "message" are required.' });
  }

  if (connectionStatus !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp Gateway is not connected yet. Current status: ' + connectionStatus });
  }

  try {
    // Format recipient phone number
    let cleanPhone = to.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      cleanPhone = `233${cleanPhone.slice(1)}`; // Ghana formatting
    } else if (cleanPhone.length === 10 && !cleanPhone.startsWith('1')) {
      cleanPhone = `1${cleanPhone}`; // US local 10-digit format
    } else if (cleanPhone.length === 9) {
      cleanPhone = `233${cleanPhone}`; // 9-digit Ghana number format
    }

    const jid = `${cleanPhone}@s.whatsapp.net`;
    
    console.log(`Sending message to ${jid}: "${message}"`);
    const sentMsg = await sock.sendMessage(jid, { text: message });

    res.json({
      success: true,
      messageId: sentMsg.key.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    res.status(500).json({ error: 'Failed to send message: ' + error.message });
  }
});

// Initialize Express and Baileys
app.listen(PORT, () => {
  console.log(`Express microservice listening on port ${PORT}`);
  connectToWhatsApp();
});
