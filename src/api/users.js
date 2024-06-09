const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const authenticateToken = require('../middleware/authenticator');
const authorizeRole = require('../middleware/authorization');
require('dotenv').config();

const router = express.Router();

router.post('/users', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  const { username, email, password, role } = req.body;
  if (req.user.role !== 'admin' && (role === 'admin' || role === 'instructor')) {
    return res.status(403).json({ error: 'Forbidden. Only admins can create users with admin or instructor roles.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role });
    res.status(201).json({ id: user.id });
  } catch (err) {
    res.status(400).json({ error: 'Invalid User object.' });
  }
});

router.post('/users/login', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/users/:id', authenticateToken, async (req, res, next) => {
  const { id } = req.params;
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({ error: 'Forbidden. You can only access your own user data.' });
  }
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/users/initial', async (req, res, next) => {
  const { username, email, password, role } = req.body;
  if (role !== 'admin') {
    return res.status(400).json({ error: 'Initial user must have admin role.' });
  }
  try {
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      return res.status(403).json({ error: 'Initial admin user already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role });
    res.status(201).json({ id: user.id });
  } catch (err) {
    res.status(400).json({ error: 'Invalid User object.' });
  }
});

module.exports = router;
