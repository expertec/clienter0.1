require('dotenv').config(); // Cargar variables de entorno desde .env
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const {
  connectToWhatsApp,
  getWhatsAppStatus,
  getCurrentQrCode,
  initializeWhatsAppConnections,
  getPhoneNumber, // Importar la función para obtener el número de teléfono
} = require('./whatsapp/whatsappClient');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './firebase-credentials.json';

    if (!serviceAccountPath) {
      throw new Error('La variable de entorno GOOGLE_APPLICATION_CREDENTIALS no está configurada correctamente o el archivo no existe.');
    }

    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath)),
    });

    console.log('Firebase Admin inicializado correctamente.');
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth(); // Instancia única de Firebase Auth

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas API
app.get('/', (req, res) => {
  res.send('API del Backend del CRM');
});

app.get('/api/whatsapp/:companyId/qr', async (req, res) => {
  const { companyId } = req.params;

  try {
    const sessionDoc = await db.collection('companySessions').doc(companyId).get();
    if (!sessionDoc.exists) {
      console.error(`No se encontró el documento de sesión para ${companyId}`);
      return res.status(404).json({ error: 'No se encontró la sesión de WhatsApp para esta empresa.' });
    }

    const { qr } = sessionDoc.data();
    if (!qr) {
      console.error(`No hay un QR disponible para ${companyId}`);
      return res.status(404).json({ error: 'No hay QR disponible para esta empresa.' });
    }

    res.status(200).json({ qr });
  } catch (error) {
    console.error(`Error al obtener el QR para ${companyId}:`, error);
    res.status(500).json({ error: 'Error al obtener el QR.' });
  }
});


// Endpoint para obtener el companyId asociado al usuario
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.error(`Usuario con ID ${userId} no encontrado.`);
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const companyId = userId; // Suponiendo que userId es igual a companyId
    res.status(200).json({ companyId });
  } catch (error) {
    console.error(`Error al obtener datos del usuario ${userId}:`, error);
    res.status(500).json({ error: 'Error al obtener datos del usuario.' });
  }
});

// Endpoint para registrar un nuevo usuario
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    const userId = userRecord.uid;

    await db.collection('users').doc(userId).set({
      name,
      email,
      role: 'admin',
    });

    await db.collection('companies').doc(userId).set({
      plan: 'freemium',
      ownerUserId: userId,
    });

    await connectToWhatsApp(userId);

    const customToken = await auth.createCustomToken(userId);

    res.status(201).json({
      companyId: userId,
      message: 'Usuario registrado con éxito',
      token: customToken,
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario. Por favor intenta de nuevo.' });
  }
});

// Endpoint para obtener el estado de conexión de WhatsApp
app.get('/api/whatsapp/:companyId/status', async (req, res) => {
  const { companyId } = req.params;

  try {
    const status = getWhatsAppStatus(companyId);
    res.status(200).json({ status });
  } catch (error) {
    console.error(`Error al obtener estado de WhatsApp para ${companyId}:`, error);
    res.status(500).json({ error: 'Error al obtener estado de WhatsApp' });
  }
});

// Endpoint para obtener el número de teléfono asociado a la sesión activa
app.get('/api/whatsapp/:companyId/phone', async (req, res) => {
  const { companyId } = req.params;

  try {
    const phoneNumber = getPhoneNumber(companyId); // Usar la función para obtener el número de teléfono
    if (!phoneNumber) {
      return res.status(404).json({ error: 'No se pudo obtener el número de teléfono.' });
    }

    res.status(200).json({ phoneNumber });
  } catch (error) {
    console.error(`Error al obtener el número de teléfono para ${companyId}:`, error);
    res.status(500).json({ error: 'Error al obtener el número de teléfono.' });
  }
});

// Inicializar conexiones de WhatsApp al iniciar el servidor
(async () => {
  try {
    const companiesSnapshot = await db.collection('companies').get();
    const companies = companiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log(`Conectando WhatsApp para ${companies.length} empresas...`);
    await initializeWhatsAppConnections(companies);
  } catch (error) {
    console.error('Error al inicializar conexiones de WhatsApp:', error.message);
  }
})();

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
