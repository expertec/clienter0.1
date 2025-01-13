const express = require('express');
const router = express.Router();
const {
  createSequence,
  getSequences,
  getSequenceById,
  updateSequence,
  deleteSequence,
} = require('../controllers/sequenceController'); // Importar funciones del controlador

// Crear una secuencia
router.post('/:companyId/create', createSequence);

// Obtener todas las secuencias de una empresa
router.get('/:companyId/list', getSequences);

// Obtener una secuencia específica por ID
router.get('/:companyId/sequence/:sequenceId', getSequenceById); // Cambié para mayor claridad

// Actualizar una secuencia específica
router.put('/:companyId/update/:sequenceId', updateSequence);

// Eliminar una secuencia específica
router.delete('/:companyId/delete/:sequenceId', deleteSequence); // Usando "delete" en la URL explícitamente

module.exports = router;
