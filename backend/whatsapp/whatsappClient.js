const { default: makeWASocket, fetchLatestBaileysVersion, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const admin = require('firebase-admin');
const QRCode = require('qrcode');
const Pino = require('pino');
const path = require('path');
const { handleIncomingMessage } = require('../handlers/messageReceiver'); // Archivo que gestiona recepción
const { sendMessageToContact } = require('../handlers/messageSender'); // Archivo que gestiona envío

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();
const qrCodes = {}; // QR Codes por empresa
const sockets = {}; // Conexiones activas por empresa
const phoneNumbers = {}; // Números de teléfono por empresa

/**
 * Conectar WhatsApp para una empresa.
 * @param {string} companyId
 */
async function connectToWhatsApp(companyId) {
  console.log(`Iniciando conexión para la empresa: ${companyId}`);
  const sessionRef = db.collection('companySessions').doc(companyId);

  const authFolderPath = path.resolve(__dirname, `../auth/${companyId}`);
  const { state, saveCreds } = await useMultiFileAuthState(authFolderPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: 'info' }),
    version,
  });

  sockets[companyId] = sock;

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    try {
      if (qr) {
        const qrCodeUrl = await QRCode.toDataURL(qr);
        qrCodes[companyId] = qrCodeUrl;
        await sessionRef.set({ qr: qrCodeUrl, status: 'qr' }, { merge: true });
        console.log(`QR generado para ${companyId}`);
      }

      if (connection === 'open') {
        console.log(`Conexión exitosa para ${companyId}`);
        qrCodes[companyId] = null;

        const phoneNumber = sock?.user?.id.split('@')[0];
        if (phoneNumber) {
          phoneNumbers[companyId] = phoneNumber;
          console.log(`Número de teléfono para ${companyId}: ${phoneNumber}`);
        }

        await sessionRef.set({ status: 'connected', qr: null }, { merge: true });
      } else if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
        console.log(`Conexión cerrada para ${companyId}. ¿Reconectar? ${shouldReconnect}`);
        if (shouldReconnect) {
          setTimeout(() => connectToWhatsApp(companyId), 5000);
        } else {
          delete phoneNumbers[companyId];
          await sessionRef.set({ creds: null, status: 'disconnected' }, { merge: true });
        }
      }
    } catch (error) {
      console.error(`Error en la conexión de ${companyId}:`, error);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Manejar mensajes entrantes
  sock.ev.on('messages.upsert', async (message) => {
    console.log(`Mensaje recibido para ${companyId}:`, message);

    if (!message || !message.messages || message.messages.length === 0) {
      console.warn('⚠️ Mensaje vacío recibido o estructura incorrecta.');
      return;
    }

    const msg = message.messages[0];
    const contactId = msg.key.remoteJid.split('@')[0]; // Número del cliente

    if (msg.key.fromMe) return; // Ignorar los mensajes enviados por la empresa misma

    try {
      // Validar si `handleIncomingMessage` es una función
      if (typeof handleIncomingMessage !== 'function') {
        throw new Error('❌ handleIncomingMessage no es una función válida. Verifica la importación.');
      }

      await handleIncomingMessage(companyId, contactId, message); // Llamada al manejador de recepción
      console.log(`✅ Mensaje entrante guardado para el contacto ${contactId} de la empresa ${companyId}`);
    } catch (error) {
      console.error(`❌ Error al manejar el mensaje de ${contactId}:`, error);
    }
  });

  return sock;
}

/**
 * Obtener cliente de WhatsApp para enviar mensajes.
 * @param {string} companyId - ID de la empresa.
 * @returns {object|null} Instancia de Baileys o null si no existe.
 */
function getWhatsAppClient(companyId) {
  if (sockets[companyId]) {
    return sockets[companyId]; // Retornar el cliente activo de Baileys
  }
  console.warn(`No se encontró una sesión activa para la empresa ${companyId}`);
  return null;
}

/**
 * Inicializar conexiones de WhatsApp para múltiples empresas.
 * @param {Array} companies Lista de empresas
 */
async function initializeWhatsAppConnections(companies) {
  console.log('Inicializando conexiones de WhatsApp...');
  for (const company of companies) {
    console.log(`Conectando WhatsApp para la empresa: ${company.id}`);
    try {
      await connectToWhatsApp(company.id);
    } catch (error) {
      console.error(`Error al conectar WhatsApp para la empresa ${company.id}:`, error);
    }
  }
}

/**
 * Obtener estado de conexión.
 * @param {string} companyId
 * @returns {string} Estado
 */
function getWhatsAppStatus(companyId) {
  if (qrCodes[companyId]) return 'qr';
  return sockets[companyId] ? 'connected' : 'disconnected';
}

/**
 * Obtener el QR actual.
 * @param {string} companyId
 * @returns {string} QR en base64
 */
function getCurrentQrCode(companyId) {
  return qrCodes[companyId];
}

/**
 * Obtener número de teléfono asociado a la sesión.
 * @param {string} companyId
 * @returns {string|null} Número de teléfono o null si no está disponible
 */
function getPhoneNumber(companyId) {
  return phoneNumbers[companyId] || null;
}

module.exports = {
  connectToWhatsApp,
  getWhatsAppStatus,
  getCurrentQrCode,
  initializeWhatsAppConnections,
  getPhoneNumber,
  sockets,
  getWhatsAppClient, // Asegúrate de exportar esta función
};
