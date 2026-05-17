const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
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

// Start Baileys WhatsApp Connection
async function connectToWhatsApp() {
  console.log('Starting WhatsApp Gateway connection...');
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth_info_baileys'));

  sock = makeWASocket({
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
      connectionStatus = 'awaiting_qr_scan';
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('WhatsApp connection closed due to:', lastDisconnect?.error || 'Unknown Error', '. Reconnecting:', shouldReconnect);
      connectionStatus = 'disconnected';
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('🚀 WhatsApp Gateway is CONNECTED and READY!');
      connectionStatus = 'connected';
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
