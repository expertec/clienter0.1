const admin = require('firebase-admin');
const db = admin.firestore();

// Crear una secuencia
const createSequence = async (req, res) => {
  const { companyId } = req.params;
  const { name, triggers, delay, messages } = req.body;

  if (!companyId || !name || !triggers || !messages || messages.length === 0) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios, incluyendo el ID del negocio.' });
  }

  try {
    const newSequence = {
      name,
      triggers,
      delay,
      status: 'activa', // por defecto activa
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      messages,
    };

    // Guardar la secuencia dentro de la subcolección del negocio correspondiente
    const docRef = await db.collection('companies').doc(companyId).collection('sequences').add(newSequence);
    res.status(201).json({ message: 'Secuencia creada con éxito.', id: docRef.id });
  } catch (error) {
    console.error('Error al crear la secuencia:', error);
    res.status(500).json({ error: 'Error al crear la secuencia.' });
  }
};

// Obtener todas las secuencias de un negocio
const getSequences = async (req, res) => {
  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json({ error: 'El ID del negocio es obligatorio.' });
  }

  try {
    const sequencesSnapshot = await db.collection('companies').doc(companyId).collection('sequences').get();

    // Asegurarse de que siempre se devuelva un array vacío si no hay secuencias
    const sequences = sequencesSnapshot.empty
      ? []
      : sequencesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(sequences);
  } catch (error) {
    console.error('Error al obtener las secuencias:', error);
    res.status(500).json({ error: 'Error al obtener las secuencias.' });
  }
};

// Obtener una secuencia por ID de un negocio específico
const getSequenceById = async (req, res) => {
  const { companyId, id } = req.params;

  if (!companyId || !id) {
    return res.status(400).json({ error: 'El ID del negocio y el ID de la secuencia son obligatorios.' });
  }

  try {
    const sequenceDoc = await db.collection('companies').doc(companyId).collection('sequences').doc(id).get();
    if (!sequenceDoc.exists) {
      return res.status(404).json({ error: 'Secuencia no encontrada.' });
    }
    res.status(200).json({ id: sequenceDoc.id, ...sequenceDoc.data() });
  } catch (error) {
    console.error('Error al obtener la secuencia:', error);
    res.status(500).json({ error: 'Error al obtener la secuencia.' });
  }
};

// Actualizar una secuencia de un negocio específico
const updateSequence = async (req, res) => {
  const { companyId, id } = req.params;
  const updatedData = req.body;

  if (!companyId || !id) {
    return res.status(400).json({ error: 'El ID del negocio y el ID de la secuencia son obligatorios.' });
  }

  try {
    await db.collection('companies').doc(companyId).collection('sequences').doc(id).update({
      ...updatedData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(200).json({ message: 'Secuencia actualizada con éxito.' });
  } catch (error) {
    console.error('Error al actualizar la secuencia:', error);
    res.status(500).json({ error: 'Error al actualizar la secuencia.' });
  }
};

// Eliminar una secuencia de un negocio específico
const deleteSequence = async (req, res) => {
  const { companyId, id } = req.params;

  if (!companyId || !id) {
    return res.status(400).json({ error: 'El ID del negocio y el ID de la secuencia son obligatorios.' });
  }

  try {
    await db.collection('companies').doc(companyId).collection('sequences').doc(id).delete();
    res.status(200).json({ message: 'Secuencia eliminada con éxito.' });
  } catch (error) {
    console.error('Error al eliminar la secuencia:', error);
    res.status(500).json({ error: 'Error al eliminar la secuencia.' });
  }
};

module.exports = {
  createSequence,
  getSequences,
  getSequenceById,
  updateSequence,
  deleteSequence,
};
