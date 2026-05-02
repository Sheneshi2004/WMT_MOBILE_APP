const Cleaning = require('../models/Cleaning');

exports.createTask = async (req, res) => {
  try {
    const task = new Cleaning(req.body);
    await task.save();
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Cleaning.find().populate('roomId', 'roomNumber roomType');
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTasksByRoom = async (req, res) => {
  try {
    const tasks = await Cleaning.find({ roomId: req.params.roomId }).populate('roomId', 'roomNumber roomType').sort({ date: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Cleaning.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after' }
    ).populate('roomId', 'roomNumber roomType');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Cleaning.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('roomId', 'roomNumber roomType');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Cleaning.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
