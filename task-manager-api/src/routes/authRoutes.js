const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Protección básica contra fuerza bruta: una vez que el servidor es
// alcanzable por red (no solo localhost), login/registro son el blanco
// más obvio para intentos automatizados.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});

router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);

module.exports = router;
