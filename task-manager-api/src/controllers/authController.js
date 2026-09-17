const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Invitation = require('../models/invitationModel');
const emailService = require('../services/emailService');

const register = async (req, res) => {
  try {
    const { name, password, token } = req.body;
    if (!name || !password || !token) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const invitation = await Invitation.findByToken(token);
    if (!invitation) {
      return res.status(403).json({ error: 'Invitación inválida' });
    }
    if (invitation.used_at) {
      return res.status(403).json({ error: 'Esta invitación ya fue utilizada' });
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(403).json({ error: 'Esta invitación ha expirado' });
    }

    const exists = await User.findByEmail(invitation.email);
    if (exists) return res.status(409).json({ error: 'El email ya está registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const userId = await User.create({
      name,
      email: invitation.email,
      password: hashed,
      role: invitation.role,
    });

    await Invitation.markUsed(invitation.id);

    emailService.notifyAdmin(emailService.notifyNewUser({ name, email: invitation.email }));

    emailService.sendWelcomeEmailToUser({ name, email: invitation.email }).catch(err => {
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
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

module.exports = { register, login };
