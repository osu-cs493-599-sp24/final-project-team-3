const express = require('express');
const userRoutes = require('./users');
const courseRoutes = require('./courses');
//const assignmentRoutes = require('./assignments');

const router = express.Router();

router.use(userRoutes);
router.use(courseRoutes);
//router.use(assignmentRoutes);

module.exports = router;
