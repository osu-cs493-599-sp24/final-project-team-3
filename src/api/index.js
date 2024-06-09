const express = require('express');
const userRoutes = require('./users');
// const courseRoutes = require('./courses');
// const assignmentRoutes = require('./assignments');
const submissionRoutes = require('./submissions');

const router = express.Router();

router.use(userRoutes);
// router.use(courseRoutes);
// router.use(assignmentRoutes);
router.use(submissionRoutes);

module.exports = router;
