const admin = require('firebase-admin');
const { getWhatsAppClient } = require('../whatsapp/whatsappClient');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore(); // Instancia de Firestore

/**
 * Enviar mensaje a un contacto.
 * @param {string} businessId - ID del negocio.
 * @param {string} contactId - Número del contacto.
 * @param {string} messageContent - Contenido del mensaje.
 */
async function sendMessageToContact(businessId, contactId, messageContent) {
  console.log('✉️ Enviando mensaje:', { businessId, contactId, messageContent });

  try {
    if (!messageContent.trim()) throw new Error('El mensaje está vacío.');

    const client = getWhatsAppClient(businessId);
    if (!client) {
      console.error(`❌ No se encontró sesión para ${businessId}`);
      throw new Error(`No se encontró sesión para ${businessId}`);
    }

    await client.sendMessage(`${contactId}@s.whatsapp.net`, { text: messageContent });
    console.log(`✅ Mensaje enviado a ${contactId}`);

    const messageId = new Date().getTime().toString();

    const businessDocRef = db.collection('companies').doc(businessId);
    const messageData = {
      messageId,
      content: messageContent,
      timestamp: new Date(),
      sender: 'business',
      status: 'sent',
    };

    await businessDocRef.set(
      {
        contacts: {
          [contactId]: {
            lastMessage: messageContent,
            lastMessageTimestamp: new Date(),
            messages: admin.firestore.FieldValue.arrayUnion(messageData),
          },
        },
      },
      { merge: true }
    );

    return { success: true, messageId };
  } catch (error) {
    console.error(`❌ Error al enviar mensaje a ${contactId}:`, error);
    throw new Error('Error al enviar mensaje.');
  }
}

module.exports = {
  sendMessageToContact,
};
