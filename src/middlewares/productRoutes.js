const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');


const { verifyToken, optionalToken } = require('./auth');
const { validate, validatePrice } = require('./validate');
const upload = require('./upload');


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