const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All payment routes require authentication
router.post('/', authMiddleware, roleGuard('admin'), paymentController.createPayment);
router.post('/generate-monthly-bills', authMiddleware, roleGuard('admin'), paymentController.generateMonthlyBills);
router.get('/', authMiddleware, paymentController.getAllPayments);
router.get('/resident/:residentId', authMiddleware, paymentController.getPaymentsByResident);
router.get('/month/:month', authMiddleware, paymentController.getPaymentsByMonth);
router.get('/status/:status', authMiddleware, paymentController.getPaymentsByStatus);
router.get('/statistics', authMiddleware, paymentController.getPaymentStatistics);
router.get('/:id', authMiddleware, paymentController.getPaymentById);
router.put('/:id/status', authMiddleware, roleGuard('admin'), paymentController.updatePaymentStatus);
router.put('/:id/pay', authMiddleware, paymentController.markAsPaid);
router.delete('/:id', authMiddleware, roleGuard('admin'), paymentController.deletePayment);

// Fake payment gateway route
router.post('/:id/process-card', authMiddleware, paymentController.processCardPayment);

module.exports = router;