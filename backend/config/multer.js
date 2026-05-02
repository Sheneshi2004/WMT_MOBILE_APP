const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    // Determine folder based on file type or route
    if (req.originalUrl.includes('/rooms')) {
      folder += 'rooms/';
    } else if (req.originalUrl.includes('/residents')) {
      folder += 'residents/';
    } else if (req.originalUrl.includes('/complaints')) {
      folder += 'complaints/';
    } else if (req.originalUrl.includes('/visitors')) {
      folder += 'visitors/';
    } else {
      folder += 'general/';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files at once
  },
  fileFilter: fileFilter
});

// Single file upload
const uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload
const uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);

// Multiple fields upload
const uploadFields = (fields) => upload.fields(fields);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
};