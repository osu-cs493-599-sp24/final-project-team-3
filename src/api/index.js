

// src/api/index.js
const express = require('express');

const assignmentRoutes = require('./assignments');
const usersRouter = require('./users');
const coursesRouter = require('./courses');
const submissionsRouter = require('./submissions');

const router = express.Router();

router.use('/', usersRouter);
router.use('/', coursesRouter);
router.use('/', submissionsRouter);
router.use('/', assignmentRoutes);
module.exports = router;




