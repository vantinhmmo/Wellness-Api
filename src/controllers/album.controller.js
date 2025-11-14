const Album = require('../models/album.model.js');

/**
 * @desc    Lấy danh sách album có phân trang và lọc theo subcategory
 * @route   GET /api/albums
 * @access  Public
 */
exports.getAlbums = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const subcategoryId = req.query.subcategory;

    const startIndex = (page - 1) * limit;

    const filter = {};
    if (subcategoryId) {
      filter['subcategories.subcategory'] = subcategoryId;
    }

    const [albums, total] = await Promise.all([
      Album.find(filter)
        .populate({
          path: 'subcategories.subcategory',
          select: 'name' 
        })
        .sort({ createdAt: -1 }) 
        .limit(limit)
        .skip(startIndex),
      Album.countDocuments(filter) 
    ]);

    const pagination = {};

    const totalPages = Math.ceil(total / limit);

    if (page < totalPages) {
      pagination.next = {
        page: page + 1,
        limit: limit
      };
    }

    if (page > 1) {
      pagination.prev = {
        page: page - 1,
        limit: limit
      };
    }

    res.status(200).json({
      success: true,
      totalAlbums: total,
      totalPages: totalPages,
      currentPage: page,
      pagination,
      data: albums
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};