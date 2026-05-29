const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

const { verifyToken, optionalToken } = require('../middlewares/auth');
const { validate, validatePrice } = require('../middlewares/validate');
const upload = require('../middlewares/upload');

// 1. Obtener todos los productos
router.get('/', optionalToken, productController.getAllProducts);

// 🚨 CORRECCIÓN CLAVE: Ponemos '/mine' ANTES de '/:id' para que no choque con el parámetro numérico
router.get('/mine', verifyToken, productController.getMineProducts);

// 2. Obtener un producto por ID (queda abajo como comodín)
router.get('/:id', optionalToken, productController.getProductById);

// 3. Acciones de producto
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