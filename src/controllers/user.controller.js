const { default: userModel } = require("../models/user.model");

/**
 * @desc    
 * @route   GET /api/users/profile
 * @access  Private (Cần token)
 */
exports.getUserProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

/**
 * @desc   
 * @route   PUT /api/users/profile
 * @access  Private 
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);


    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar || user.avatar;

      if (req.file) {
        user.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};