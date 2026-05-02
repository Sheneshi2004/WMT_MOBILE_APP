const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All resident management routes require admin authentication
router.post('/', authMiddleware, roleGuard('admin'), residentController.createResident);
router.get('/', authMiddleware, residentController.getAllResidents);
router.get('/search', authMiddleware, residentController.searchResidents);
router.get('/status/:status', authMiddleware, residentController.getResidentsByStatus);
router.get('/room/:roomId', authMiddleware, residentController.getResidentsByRoom);


router.get('/me', authMiddleware, residentController.getMyProfile);
router.put('/me', authMiddleware, residentController.updateMyProfile);
router.put('/me/book', authMiddleware, residentController.bookRoom); 

router.get('/:id', authMiddleware, residentController.getResidentById);
router.get('/:id/history', authMiddleware, residentController.getRoomHistory);
router.put('/:id', authMiddleware, roleGuard('admin'), residentController.updateResident);
router.put('/:id/room', authMiddleware, roleGuard('admin'), residentController.assignRoom);
router.put('/:id/status', authMiddleware, roleGuard('admin'), residentController.updateStatus);
router.put('/:id/profile-image', authMiddleware, residentController.updateProfileImage);
router.delete('/:id', authMiddleware, roleGuard('admin'), residentController.deleteResident);

module.exports = router;