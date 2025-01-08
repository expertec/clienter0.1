const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

const db = admin.firestore();
const auth = admin.auth(); // Instancia de Firebase Auth

// Endpoint para crear un agente
router.post('/create', async (req, res) => {
  const { companyId, name, email, password } = req.body;

  if (!companyId || !name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    let userRecord;

    // Verificar si el usuario ya existe en Firebase Auth
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`El usuario con el correo ${email} ya existe con UID: ${userRecord.uid}`);

      // Verificar si el usuario ya pertenece a un negocio
      const existingUser = await db.collection('users').doc(userRecord.uid).get();
      if (existingUser.exists) {
        const userData = existingUser.data();
        if (userData.businessId !== companyId) {
          return res.status(400).json({
            error: 'El correo ya está asociado a otro negocio. No puede reutilizarse.',
          });
        }
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Si el usuario no existe, crear uno nuevo
        userRecord = await auth.createUser({
          email,
          password,
          displayName: name,
        });
        console.log(`Nuevo usuario creado con UID: ${userRecord.uid}`);
      } else {
        throw error; // Si es otro error, arrojarlo
      }
    }

    const agentId = userRecord.uid;

    // Actualizar el usuario en la colección `users` con rol `agent` y `businessId`
    await db.collection('users').doc(agentId).set(
      {
        name,
        email,
        role: 'agent',
        businessId: companyId,
        status: 'active',
      },
      { merge: true } // Para no sobrescribir datos existentes
    );

    // Agregar el agente al array `agents` del documento de la empresa
    await db.collection('companies').doc(companyId).update({
      agents: admin.firestore.FieldValue.arrayUnion(agentId),
    });

    res.status(201).json({
      message: 'Agente creado con éxito.',
    });
  } catch (error) {
    console.error('Error al crear agente:', error);

    if (error.code === 'auth/email-already-exists') {
      res.status(400).json({
        error: 'El correo electrónico ya está en uso. Por favor, usa otro correo o selecciona al usuario existente.',
      });
    } else {
      res.status(500).json({ error: 'Error al crear agente. Intenta nuevamente.' });
    }
  }
});

// Endpoint para listar agentes de un negocio
router.get('/:companyId/list', async (req, res) => {
  const { companyId } = req.params;

  try {
    // Obtener los IDs de los agentes desde el documento de la empresa
    const companyDoc = await db.collection('companies').doc(companyId).get();
    if (!companyDoc.exists) {
      return res.status(404).json({ error: 'Empresa no encontrada.' });
    }

    const companyData = companyDoc.data();
    const agentIds = companyData.agents || [];

    if (agentIds.length === 0) {
      return res.status(200).json([]);
    }

    // Obtener los datos de los agentes desde la colección `users`
    const agentDocs = await Promise.all(
      agentIds.map((agentId) => db.collection('users').doc(agentId).get())
    );

    const agents = agentDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(agents);
  } catch (error) {
    console.error('Error al listar agentes:', error);
    res.status(500).json({ error: 'Error al listar agentes. Intenta nuevamente.' });
  }
});

// Endpoint para eliminar un agente (tanto del negocio como de Firebase Auth)
router.delete('/:companyId/delete/:agentId', async (req, res) => {
  const { companyId, agentId } = req.params;

  try {
    // Eliminar el agente de la colección `agents` del negocio
    await db.collection('companies').doc(companyId).update({
      agents: admin.firestore.FieldValue.arrayRemove(agentId),
    });

    // Eliminar la cuenta del agente en Firebase Auth
    await auth.deleteUser(agentId);

    // Eliminar el documento del agente en la colección `users`
    await db.collection('users').doc(agentId).delete();

    res.status(200).json({ message: 'Agente eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar el agente:', error);
    res.status(500).json({ error: 'Error al eliminar el agente.' });
  }
});

// Exportar las rutas
module.exports = router;
