// Format currency
const formatCurrency = (amount, currency = 'LKR') => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
  if (format === 'DD-MM-YYYY') return `${day}-${month}-${year}`;
  if (format === 'full') return `${year}-${month}-${day} ${hours}:${minutes}`;
  return `${year}-${month}-${day}`;
};

// Generate random ID
const generateRandomId = (prefix = '', length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}${result}` : result;
};

// Calculate late fee
const calculateLateFee = (dueDate, paidDate = null, dailyFee = 50) => {
  const due = new Date(dueDate);
  const paid = paidDate ? new Date(paidDate) : new Date();
  
  if (paid <= due) return 0;
  
  const daysLate = Math.floor((paid - due) / (1000 * 60 * 60 * 24));
  return daysLate * dailyFee;
};

// Validate Sri Lankan NIC
const validateNIC = (nic) => {
  const oldNicRegex = /^[0-9]{9}[Vv]$/;
  const newNicRegex = /^[0-9]{12}$/;
  return oldNicRegex.test(nic) || newNicRegex.test(nic);
};

// Validate Sri Lankan phone number
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Pagination helper
const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  
  return {
    skip,
    limit: limitNum,
    page: pageNum
  };
};

// Pagination response helper
const paginationResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

// Remove null/undefined values from object
const cleanObject = (obj) => {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      result[key] = obj[key];
    }
  }
  return result;
};

// Sleep/delay function
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Capitalize first letter
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
const truncate = (str, length = 100, suffix = '...') => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

module.exports = {
  formatCurrency,
  formatDate,
  generateRandomId,
  calculateLateFee,
  validateNIC,
  validatePhoneNumber,
  paginate,
  paginationResponse,
  cleanObject,
  sleep,
  capitalize,
  truncate
};