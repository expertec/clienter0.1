// controllers/userController.js
const userService = require('../services/userService');

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

exports.getProfile = (req, res) => {
  const user = req.user; // Aquí tienes la información del usuario autenticado
  // Por ejemplo, user.uid, user.email, etc.
  res.status(200).json({ user });
};


exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    await userService.createUser({ name, email });
    res.status(201).json({ message: 'Usuario creado con éxito' });
  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

