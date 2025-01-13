const express = require('express');
const router = express.Router();
const { upload, uploadToFirebase } = require('../middlewares/uploadMiddleware'); // Importar función para subir a Firebase Storage

// Ruta para subir archivos
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  try {
    // Subir archivo a Firebase Storage
    const fileUrl = await uploadToFirebase(req.file);
    res.status(201).json({ url: fileUrl }); // Devolver la URL pública de Firebase Storage
  } catch (error) {
    console.error('Error al subir archivo a Firebase Storage:', error);
    res.status(500).json({ error: 'Error al subir archivo. Intenta nuevamente.' });
  }
});

// Ruta para servir archivos estáticos desde la carpeta "uploads" (solo se usará si decides usar almacenamiento local)
router.use('/uploads', express.static('uploads'));

module.exports = router;
