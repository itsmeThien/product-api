const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    pid: {
      type: String,
      required: [true, 'Product ID (pid) is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    pname: {
      type: String,
      required: [true, 'Product Name (pname) is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    quantity: {
      type: Number,
      required: [true, 'Product Quantity is required'],
      min: [0, 'Quantity must be greater than or equal to 0'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value for quantity',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Product', productSchema);
