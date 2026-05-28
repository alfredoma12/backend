const express = require('express');
const router = express.Router();

// Importar controladores y middlewares
const { getProfile, updateProfile, getUserProducts } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth');

// Rutas Privadas (Requieren Token)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Ruta Pública (Ver los productos en venta de un usuario específico)
router.get('/:id/products', getUserProducts);

module.exports = router;