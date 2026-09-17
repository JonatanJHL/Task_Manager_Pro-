const User = require('../models/userModel');

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error('Error getUsers:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

module.exports = { getUsers };
