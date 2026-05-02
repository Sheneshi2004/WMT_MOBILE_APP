const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

// ===== PUBLIC ROUTES (No Auth) =====
router.post('/request', visitorController.submitVisitRequest);

// ===== ADMIN ROUTES =====
router.get('/requests', visitorController.getAllVisitRequests);
router.get('/pending', visitorController.getPendingRequests);
router.get('/approved', visitorController.getApprovedRequests);
router.get('/statistics', visitorController.getVisitorStatistics);
router.get('/:id', visitorController.getVisitRequestById);
router.put('/:id/approve', visitorController.approveVisitRequest);
router.put('/:id/reject', visitorController.rejectVisitRequest);
router.delete('/:id', visitorController.deleteVisitRequest);

// ===== SECURITY ROUTES =====
router.put('/:id/check-in', visitorController.checkIn);
router.put('/:id/check-out', visitorController.checkOut);

module.exports = router;