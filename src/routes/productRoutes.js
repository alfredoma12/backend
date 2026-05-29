const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');

// Ruta corregida apuntando correctamente a la carpeta middlewares
const { verifyToken, optionalToken } = require('../middlewares/auth');
const { validate, validatePrice } = require('../middlewares/validate');
const upload = require('../middlewares/upload');

router.get('/', optionalToken, productController.getAllProducts);
router.get('/:id', optionalToken, productController.getProductById);

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