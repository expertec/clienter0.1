const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode-terminal');
const Pino = require('pino');

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  try {
    // Obtener la última versión del protocolo de Baileys
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      auth: state,
      logger: Pino({ level: 'info' }), // Cambiar a 'info' para reducir el ruido en los logs
      printQRInTerminal: true, // Mostrar QR en la terminal
      version, // Usar la última versión compatible
    });

    // Manejador de eventos de conexión
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        QRCode.generate(qr, { small: true });
        console.log('Escanea el QR para conectarte.');
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log('Conexión cerrada. Razón:', reason);

        const shouldReconnect = reason !== DisconnectReason.loggedOut;
        console.log('¿Reconectar?', shouldReconnect);

        if (shouldReconnect) connectToWhatsApp();
      } else if (connection === 'open') {
        console.log('Conexión exitosa con WhatsApp!');
      }
    });

    // Guardar credenciales al actualizarse
    sock.ev.on('creds.update', saveCreds);

    // Manejador para nuevos mensajes
    sock.ev.on('messages.upsert', (msg) => {
      console.log('Mensaje recibido:', JSON.stringify(msg, null, 2));
    });

    // Manejador para confirmaciones (ACK)
    sock.ev.on('messages.update', (updates) => {
      updates.forEach((update) => {
        console.log('Confirmación recibida para mensaje:', update.key.id);
      });
    });

    // Manejador para actualizaciones no procesadas
    sock.ev.on('syncAction', (sync) => {
      console.log('Sincronización recibida (ignorada):', sync);
    });

  } catch (error) {
    console.error('Error al conectar con WhatsApp:', error);
  }
}

connectToWhatsApp();
