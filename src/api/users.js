const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const authenticateToken = require('../middleware/authenticator');
const authorizeRole = require('../middleware/authorization');
require('dotenv').config();

const router = express.Router();

/*
 * POST /users - Route to create a new user.
 * Only an authenticated user with 'admin' role can create users with 'admin' or 'instructor' roles.
 */
router.post('/users', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  const { username, email, password, role } = req.body;
  
  if (req.user.role !== 'admin' && (role === 'admin' || role === 'instructor')) {
    return res.status(403).json({ error: 'Forbidden. Only admins can create users with admin or instructor roles.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role });
    
    // Generate token after creating user
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    // Log the token
    console.log(`Generated token for user ${username}: ${token}`);

    res.status(201).json({ id: user.id, token });
  } catch (err) {
    res.status(400).json({ error: 'Invalid User object.' });
  }
});

/*
 * POST /users/login - Route to log in a user.
 * Authenticates a user with their email address and password.
 */
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

/*
 * GET /users/:id - Route to fetch data about a specific user.
 * Only the authenticated user whose ID matches the requested user ID can fetch this information.
 */
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

/*
 * POST /users/initial - Route to create the initial admin user.
 * This route should only be used once to create the initial admin user.
 */
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
