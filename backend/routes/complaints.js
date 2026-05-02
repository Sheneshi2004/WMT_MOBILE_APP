const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All complaint routes require authentication
router.post('/', authMiddleware, complaintController.createComplaint);
router.get('/', authMiddleware, complaintController.getAllComplaints);
router.get('/resident/:residentId', authMiddleware, complaintController.getComplaintsByResident);
router.get('/status/:status', authMiddleware, complaintController.getComplaintsByStatus);
router.get('/priority/:priority', authMiddleware, complaintController.getComplaintsByPriority);
router.get('/statistics', authMiddleware, complaintController.getComplaintStatistics);
router.get('/:id', authMiddleware, complaintController.getComplaintById);
router.put('/:id/status', authMiddleware, roleGuard('admin'), complaintController.updateComplaintStatus);
router.put('/:id/resolve', authMiddleware, roleGuard('admin'), complaintController.resolveComplaint);
router.put('/:id/rate', authMiddleware, complaintController.rateComplaint);
router.delete('/:id', authMiddleware, roleGuard('admin'), complaintController.deleteComplaint);

module.exports = router;