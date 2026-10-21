const Product = require('../models/product.model');

// @desc    Create a new product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { pid, pname, price, quantity } = req.body;

    if (!pid || !pname || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: pid, pname, price, quantity',
      });
    }

    const existingProduct = await Product.findOne({ pid: pid.toUpperCase() });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: `Product with pid '${pid}' already exists`,
      });
    }

    const product = new Product({
      pid,
      pname,
      price,
      quantity,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get all products
// @route   GET /api/products
exports.getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { pid: { $regex: search, $options: 'i' } },
          { pname: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Get product by pid
// @route   GET /api/products/:pid
exports.getProductByPid = async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await Product.findOne({ pid: pid.toUpperCase() });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with pid '${pid}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Update product by pid
// @route   PUT /api/products/:pid
exports.updateProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const { pname, price, quantity } = req.body;

    const product = await Product.findOne({ pid: pid.toUpperCase() });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with pid '${pid}' not found`,
      });
    }

    if (pname !== undefined) product.pname = pname;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

// @desc    Delete product by pid
// @route   DELETE /api/products/:pid
exports.deleteProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await Product.findOneAndDelete({ pid: pid.toUpperCase() });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with pid '${pid}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};
