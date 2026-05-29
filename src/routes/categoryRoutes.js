const express = require('express');
const router  = express.Router();
const { getAllCategories } = require('../controllers/categoryController');

// Definir el endpoint para obtener categorías
router.get('/', getAllCategories);

// 🚨 ESTA LÍNEA ES LA CRUCIAL QUE FALTA O ESTÁ MAL ESCRITA:
module.exports = router;