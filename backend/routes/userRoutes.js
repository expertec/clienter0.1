// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta abierta (no requiere token) para obtener usuarios
router.get('/', userController.getUsers);

// Ruta abierta (no requiere token) para crear un usuario
router.post('/', userController.createUser);

// Ruta protegida (requiere token) para el perfil
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;
