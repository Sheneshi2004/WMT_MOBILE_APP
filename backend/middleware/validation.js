const { body, param, query, validationResult } = require('express-validator');

// ==================== USER VALIDATION ====================
const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required')
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// ==================== ROOM VALIDATION ====================
const validateRoom = [
  body('roomNumber').notEmpty().withMessage('Room number is required'),
  body('roomType').isIn(['Single', 'Double', 'Triple', 'Shared']).withMessage('Invalid room type'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('pricePerMonth').isNumeric().withMessage('Price must be a number')
];

const validateRoomStatus = [
  body('status').isIn(['available', 'occupied', 'maintenance', 'reserved']).withMessage('Invalid status')
];

// ==================== RESIDENT VALIDATION ====================
const validateResident = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('nic').notEmpty().withMessage('NIC is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('year').isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  body('guardianName').notEmpty().withMessage('Guardian name is required'),
  body('guardianPhone').isMobilePhone().withMessage('Valid guardian phone is required'),
  body('checkInDate').isDate().withMessage('Valid check-in date is required')
];

// ==================== PAYMENT VALIDATION ====================
const validatePayment = [
  body('residentId').notEmpty().withMessage('Resident ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('month').isDate().withMessage('Valid month is required'),
  body('dueDate').isDate().withMessage('Valid due date is required')
];

// ==================== COMPLAINT VALIDATION ====================
const validateComplaint = [
  body('residentId').notEmpty().withMessage('Resident ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['maintenance', 'electricity', 'water', 'food', 'cleanliness', 'security', 'other']).withMessage('Invalid category')
];

// ==================== ATTENDANCE VALIDATION ====================
const validateAttendance = [
  body('residentId').notEmpty().withMessage('Resident ID is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('status').isIn(['present', 'absent', 'late', 'leave', 'holiday']).withMessage('Invalid status')
];

// ==================== VISITOR VALIDATION ====================
const validateVisitorRequest = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('preferredRoomType').isIn(['Single', 'Double', 'Triple', 'Shared', 'Any']).withMessage('Invalid room type'),
  body('preferredVisitDate').isDate().withMessage('Valid date is required')
];

// ==================== ID PARAM VALIDATION ====================
const validateIdParam = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

// ==================== PAGINATION VALIDATION ====================
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// ==================== VALIDATION RESULT HANDLER ====================
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  // User
  validateRegister,
  validateLogin,
  // Room
  validateRoom,
  validateRoomStatus,
  // Resident
  validateResident,
  // Payment
  validatePayment,
  // Complaint
  validateComplaint,
  // Attendance
  validateAttendance,
  // Visitor
  validateVisitorRequest,
  // Common
  validateIdParam,
  validatePagination,
  handleValidationErrors
};