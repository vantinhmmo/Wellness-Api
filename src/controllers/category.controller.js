const Category = require('../models/category.model.js');
require('../models/subcategory.model.js'); 

/**
 * @desc    Lấy tất cả các category và populate các subcategory liên quan
 * @route   GET /api/categories
 * @access  Public
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order_number: 'asc' })
      .populate({
        path: 'subcategories.subcategory',
        model: 'Subcategory',
        select: 'name description cover_image'
      });

    categories.forEach(category => {
      if (category.subcategories) {
        category.subcategories.sort((a, b) => a.order_number - b.order_number);
      }
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
    });
  }
};