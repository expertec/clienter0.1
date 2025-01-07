const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore(); // Instancia de Firestore

/**
 * Manejar un mensaje entrante desde WhatsApp.
 * @param {string} businessId - ID de la empresa.
 * @param {string} contactId - Número del contacto.
 * @param {object} message - Objeto del mensaje recibido.
 */
async function handleIncomingMessage(businessId, contactId, message) {
  console.log('📥 Mensaje recibido:', { businessId, contactId, message });

  try {
    const msg = message.messages?.[0] || {};
    const msgContent =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      'Mensaje sin contenido';

    if (!msgContent) {
      console.warn(`⚠️ Mensaje vacío de ${contactId}.`);
      return;
    }

    const messageId = msg.key?.id || 'ID-desconocido';

    const businessDocRef = db.collection('companies').doc(businessId);

    const contactData = {
      phoneNumber: contactId,
      lastMessage: msgContent,
      lastMessageTimestamp: new Date(),
      messages: admin.firestore.FieldValue.arrayUnion({
        messageId,
        content: msgContent,
        timestamp: new Date(),
        sender: 'client',
        status: 'received',
      }),
    };

    await businessDocRef.set(
      {
        contacts: {
          [contactId]: contactData,
        },
      },
      { merge: true }
    );

    console.log(`✅ Mensaje de ${contactId} guardado en Firestore.`);
  } catch (error) {
    console.error(`❌ Error al manejar el mensaje entrante de ${contactId}:`, error);
  }
}

module.exports = {
  handleIncomingMessage,
};
