const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const User = require('../models/userModel');
const emailService = require('../services/emailService');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const exists = await User.findByEmail(email);
    if (exists) return res.status(409).json({ error: 'El email ya está registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    const userId = result.insertId;

    await db.query(
      'INSERT INTO projects (name, description, user_id) VALUES (?, ?, ?)',
      ['Mi Primer Proyecto', 'Proyecto creado automáticamente', userId]
    );

    emailService.notifyAdmin(emailService.notifyNewUser({ name, email }));

    emailService.sendWelcomeEmailToUser({ name, email }).catch(err => {
      console.log('Welcome email error:', err.message);
    });

    emailService.scheduleTutorialSequence(userId, User);

    res.status(201).json({ id: userId, message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('Error register:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { register, login };
