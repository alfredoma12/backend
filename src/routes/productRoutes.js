const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

const { verifyToken, optionalToken } = require('../middlewares/auth');
const { validate, validatePrice } = require('../middlewares/validate');
const upload = require('../middlewares/upload');

// 1. Rutas de obtención generales
router.get('/', optionalToken, productController.getAllProducts);

// 🚨 CORRECCIÓN CRUCIAL: Ponemos '/mine' ANTES de '/:id' para que Express no se confunda
router.get('/mine', verifyToken, productController.getMineProducts);

// 2. Ruta con parámetro dinámico al final
router.get('/:id', optionalToken, productController.getProductById);

// 3. Rutas de acción (Crear, Editar, Borrar)
router.post(
  '/',
  verifyToken,
  upload.single('image'),
  validate(['title', 'price', 'category_id']),
  validatePrice,
  productController.createProduct
);

router.put('/:id', verifyToken, productController.updateProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;