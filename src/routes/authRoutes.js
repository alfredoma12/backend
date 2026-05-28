const express = require('express');
const router = express.Router();

// Importar controladores y middlewares
const { register, login } = require('../controllers/authController');
const { validate, validateEmail } = require('../middlewares/validate');

// POST /api/auth/register
router.post('/register', validate(['name', 'email', 'password']), validateEmail, register);

// POST /api/auth/login
router.post('/login', validate(['email', 'password']), validateEmail, login);

module.exports = router;