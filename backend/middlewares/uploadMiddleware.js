const multer = require('multer');
const { getStorage } = require('firebase-admin/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

// Configuración de Multer (memoria para pasar buffer a Firebase Storage)
const storage = multer.memoryStorage();

// Middleware de carga de archivos
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite de tamaño
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Aceptar archivo
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo imágenes, videos, audios y PDFs son aceptados.'));
    }
  },
});

// Función para subir archivo a Firebase Storage
const uploadToFirebase = async (file) => {
  console.log('--- Inicio de carga de archivo ---');
  console.log('Archivo recibido:', file.originalname);
  console.log('Tipo de archivo:', file.mimetype);

  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'clienter-df7a5.firebasestorage.app'; // Usar env o valor por defecto
  const bucket = admin.storage().bucket(bucketName); // Especificar explícitamente el bucket

  console.log('Bucket asignado:', bucket.name);

  try {
    // Comprobar conexión al bucket
    const [exists] = await bucket.exists();
    if (!exists) {
      console.error('El bucket no existe o no es accesible');
      throw new Error(`El bucket "${bucketName}" no existe o no se puede acceder.`);
    } else {
      console.log('Conexión al bucket exitosa');
    }

    const destination = `uploads/${uuidv4()}_${file.originalname}`; // Nombre único en el bucket
    console.log('Ruta destino del archivo en el bucket:', destination);

    // Guardar el archivo en Firebase Storage
    await bucket.file(destination).save(file.buffer, {
      metadata: {
        contentType: file.mimetype, // Tipo de contenido del archivo
      },
    });

    console.log('Archivo guardado en el bucket con éxito.');

    // Obtener URL pública firmada
    const [url] = await bucket.file(destination).getSignedUrl({
      action: 'read',
      expires: '03-01-2030', // Fecha de expiración
    });

    console.log('URL pública del archivo:', url);
    console.log('--- Fin de carga de archivo ---');
    return url; // Devolver la URL pública del archivo en Firebase Storage
  } catch (error) {
    console.error('Error al subir archivo a Firebase Storage:', error.message);
    console.error('Detalles del error:', error);
    throw new Error(`Error al subir archivo: ${error.message}`);
  }
};

// Prueba de acceso al bucket al cargar el servidor
(async () => {
  try {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'clienter-df7a5.firebasestorage.app';
    const bucketTest = admin.storage().bucket(bucketName);
    const [exists] = await bucketTest.exists();
    if (exists) {
      console.log(`El bucket "${bucketName}" está accesible.`);
    } else {
      console.error(`El bucket "${bucketName}" no se puede encontrar.`);
    }
  } catch (err) {
    console.error('Error al verificar el bucket en la inicialización:', err.message);
  }
})();

// Exportar el middleware y la función de carga
module.exports = {
  upload,
  uploadToFirebase,
};
