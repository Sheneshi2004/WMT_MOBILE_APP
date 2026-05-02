const express = require('express');
const router = express.Router();
const cleaningController = require('../controllers/cleaningController');

router.post('/', cleaningController.createTask);
router.get('/', cleaningController.getAllTasks);
router.get('/room/:roomId', cleaningController.getTasksByRoom);
router.put('/:id', cleaningController.updateTask);
router.put('/:id/status', cleaningController.updateTaskStatus);
router.delete('/:id', cleaningController.deleteTask);

module.exports = router;
