const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// ========== SPECIFIC ROUTES FIRST (BEFORE /:id) ==========
router.post('/mark', attendanceController.markAttendance);
router.get('/statistics', attendanceController.getAttendanceStatistics);
router.get('/report', attendanceController.getAttendanceReport);
router.get('/resident/:residentId', attendanceController.getAttendanceByResident);
router.get('/date/:date', attendanceController.getAttendanceByDate);
router.get('/', attendanceController.getAllAttendance);

// ========== GENERIC /:id ROUTE LAST ==========
router.get('/:id', attendanceController.getAttendanceById);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

// ========== FOOD PREFERENCE ROUTES ==========
router.post('/food/preference', attendanceController.setFoodPreference);
router.get('/food/preference', attendanceController.getAllFoodPreferences);
router.get('/food/preference/:residentId', attendanceController.getFoodPreference);
router.put('/food/preference/:id', attendanceController.updateFoodPreference);
router.delete('/food/preference/:id', attendanceController.deleteFoodPreference);
router.get('/food/menu', attendanceController.getTodaysMenu);
router.post('/food/menu', attendanceController.createMealMenu);
router.put('/food/menu/:id', attendanceController.updateMealMenu);
router.delete('/food/menu/:id', attendanceController.deleteMealMenu);

module.exports = router;