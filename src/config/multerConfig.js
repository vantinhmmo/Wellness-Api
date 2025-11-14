// config/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/avatars');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  // Sử dụng regex để kiểm tra mimetype
  const allowedMimes = /jpeg|jpg|png|gif/;
  const isMimeValid = allowedMimes.test(file.mimetype);
  const isExtValid = allowedMimes.test(path.extname(file.originalname).toLowerCase());

  if (isMimeValid && isExtValid) {
    cb(null, true); 
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif)!'), false); // Từ chối file
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 
  }
});

module.exports = upload;