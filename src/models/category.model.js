// models/Category.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: null,
  },
  cover_image: {
    type: String,
    default: null,
  },
  order_number: {
    type: Number,
    default: 0,
  },
  subcategories: [
    {
      subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'Subcategory', 
        required: true,
      },
      order_number: { 
        type: Number,
        default: 0,
      },
    }
  ]
}, {
  timestamps: true,
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;