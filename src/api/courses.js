const { Router } = require('express');
const { Course } = require('../models/courses');
const authenticateToken = require('../middleware/authenticator');
const authorizeRole = require('../middleware/authorization');

const router = Router();

router.post('/courses', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).send({ id: course.id });
  } catch (e) {
    res.status(400).json({ error: 'Invalid Course data.' });
  }
});

router.get('/courses', async (req, res, next) => {
  try {
    const courses = await Course.findAll();
    res.status(200).json(courses);
  } catch (e) {
    res.status(500).json({ error: 'Failed to retrieve courses.' });
  }
});

module.exports = router;
