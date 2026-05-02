const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const user = new User({ name, email, password, phone, role: role || 'resident' });
    await user.save();
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.status(201).json({ success: true, data: { _id: user._id, name, email, phone, role: user.role, token } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Auto-seed admin user if they are logging in and it doesn't exist
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@hostel.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123';
    
    if (email === adminEmail) {
      let adminUser = await User.findOne({ email: adminEmail });
      if (!adminUser) {
        // Auto-create admin if not exists (only when correct password given)
        if (password !== adminPassword) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        adminUser = new User({
          name: 'Hostel Admin',
          email: adminEmail,
          password: adminPassword,
          phone: '0000000000',
          role: 'admin'
        });
        await adminUser.save();
      } else {
        // Verify password using bcrypt (password is already hashed in DB)
        const isMatch = await adminUser.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
      }
      
      const token = jwt.sign({ id: adminUser._id, email: adminUser.email, role: adminUser.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.status(200).json({ success: true, data: { _id: adminUser._id, name: adminUser.name, email: adminUser.email, phone: adminUser.phone, role: adminUser.role, token } });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    res.status(200).json({ success: true, data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, token } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// VERIFY TOKEN
const verifyToken = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ success: true, message: 'Token is valid', data: decoded });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdAndUpdate(decoded.id, req.body, { returnDocument: 'after' }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, verifyToken, getProfile, updateProfile };