const express = require('express');
const router  = express.Router();
const { getAllCategories } = require('../controllers/categoryController');

// Línea 6 corregida: ahora getAllCategories sí tendrá un valor real y no undefined
router.get('/', getAllCategories);

module.exports = router;