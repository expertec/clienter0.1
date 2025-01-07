const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const db = admin.firestore();

router.get('/contacts/:companyId', async (req, res) => {
  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json({ error: 'El parámetro companyId es requerido.' });
  }

  try {
    const contactsRef = db.collection('businesses').doc(companyId).collection('contacts');
    const snapshot = await contactsRef.get();

    if (snapshot.empty) {
      console.warn(`No se encontraron contactos para la empresa con ID: ${companyId}`);
      return res.status(404).json({ error: 'No se encontraron contactos.' });
    }

    const contacts = [];
    snapshot.forEach((doc) => {
      contacts.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Contactos obtenidos para la empresa ${companyId}:`, contacts.length);
    res.status(200).json(contacts);
  } catch (error) {
    console.error(`Error al obtener contactos para la empresa ${companyId}:`, error);
    res.status(500).json({ error: 'Error al obtener los contactos.' });
  }
});

module.exports = router;
