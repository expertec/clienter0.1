const admin = require('firebase-admin');

// Verifica si la variable de entorno está configurada
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('La variable de entorno GOOGLE_APPLICATION_CREDENTIALS no está configurada.');
}

// Inicializa Firebase si aún no está inicializado
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(), // Usa las credenciales especificadas por la variable de entorno
    });
}

const db = admin.firestore();
module.exports = db;
