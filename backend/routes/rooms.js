const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.get('/', roomController.getAllRooms);
router.get('/available', roomController.getAvailableRooms);
router.get('/public', roomController.getPublicRooms);
router.get('/search', roomController.searchRooms);
router.get('/sort/price', roomController.sortByPrice);
router.get('/statistics', authMiddleware, roomController.getRoomStatistics);
router.get('/reminders', authMiddleware, roomController.getActiveReminders);
router.get('/type/:roomType', roomController.filterByRoomType);
router.get('/status/:status', roomController.filterByStatus);
router.get('/capacity/:capacity', roomController.filterByCapacity);
router.get('/price-range', roomController.filterByPriceRange);
router.get('/:id', roomController.getRoomById);
router.get('/:id/residents', authMiddleware, roomController.getResidentsInRoom);

router.post('/', authMiddleware, roleGuard('admin'), roomController.createRoom);
router.put('/:id', authMiddleware, roleGuard('admin'), roomController.updateRoom);
router.put('/:id/status', authMiddleware, roleGuard('admin'), roomController.updateRoomStatus);
router.put('/:id/reminder', authMiddleware, roleGuard('admin'), roomController.setReminder);
router.delete('/:id', authMiddleware, roleGuard('admin'), roomController.deleteRoom);
router.delete('/:id/reminder', authMiddleware, roleGuard('admin'), roomController.deleteReminder);

router.post('/:id/images', authMiddleware, roleGuard('admin'), roomController.addRoomImages);
router.put('/:id/images', authMiddleware, roleGuard('admin'), roomController.replaceRoomImages);
router.delete('/:id/images/:imageIndex', authMiddleware, roleGuard('admin'), roomController.deleteRoomImage);
router.delete('/:id/images', authMiddleware, roleGuard('admin'), roomController.deleteAllRoomImages);

module.exports = router;