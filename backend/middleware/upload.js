const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create upload directories
const uploadDirs = [
  'uploads/rooms',
  'uploads/residents',
  'uploads/complaints',
  'uploads/visitors',
  'uploads/general'
];

uploadDirs.forEach(dir => ensureDirectoryExists(dir));

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/general';
    
    if (req.originalUrl.includes('/rooms')) {
      folder = 'uploads/rooms';
    } else if (req.originalUrl.includes('/residents')) {
      folder = 'uploads/residents';
    } else if (req.originalUrl.includes('/complaints')) {
      folder = 'uploads/complaints';
    } else if (req.originalUrl.includes('/visitors')) {
      folder = 'uploads/visitors';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = (fieldName) => (req, res, next) => {
  const uploadMiddleware = upload.single(fieldName);
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Max 5MB' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 5) => (req, res, next) => {
  const uploadMiddleware = upload.array(fieldName, maxCount);
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Max 5MB' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: `Too many files. Max ${maxCount}` });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Middleware for multiple fields upload
const uploadFields = (fields) => (req, res, next) => {
  const uploadMiddleware = upload.fields(fields);
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
};