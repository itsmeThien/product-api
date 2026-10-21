const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// CRUD Routes for Products
router
  .route('/')
  .post(productController.createProduct)
  .get(productController.getAllProducts);

router
  .route('/:pid')
  .get(productController.getProductByPid)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
