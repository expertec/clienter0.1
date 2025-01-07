const express = require('express');
const { sendMessage } = require('../handlers/messageHandler'); // Importamos la función sendMessage

const router = express.Router();

/**
 * Endpoint para enviar mensajes desde el CRM al cliente.
 * Ruta: POST /api/messages/send
 */
router.post('/send', async (req, res) => {
  const { businessId, contactId, content } = req.body;

  // Validación de datos requeridos
  if (!businessId || !contactId || !content) {
    return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
  }

  try {
    // Llamada a la función sendMessage para enviar el mensaje y guardar en Firestore
    const result = await sendMessage(businessId, contactId, content);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
