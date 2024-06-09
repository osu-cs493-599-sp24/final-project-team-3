const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../config/validation');
const database = require("../config/database");
const { authorizeRole } = require("../middleware/authorization");
const { authenticateToken, matchesCourseInstructor } = require("../middleware/authenticator");
const ObjectId = require("sequelize").ObjectId;

exports.router = router;

const assignmentSchema = {
  courseId: { required: true },
  title: { required: true },
  description: { required: true },
  dueDate: { required: true }
};

const submissionSchema = {
  studentId: { required: true },
  assignmentId: { required: true },
  file: { required: true },
  timestamp: { required: true }
};

// POST /assignments
router.post('/assignments', async (req, res, next) => {
  const { role, id: userId } = req.user;

  if (role !== 'admin' && !(role === 'instructor' && await matchesCourseInstructor(userId, req.body.courseId))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (validateAgainstSchema(req.body, assignmentSchema)) {
    const assignment = extractValidFields(req.body, assignmentSchema);
    try {
      const db = database.getDB();
      const result = await db.collection('assignments').insertOne(assignment);
      res.status(201).json({
        _id: result.insertedId,
        links: {
          assignment: `/assignments/${result.insertedId}`
        }
      });
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).json({ error: 'Invalid Assignment object' });
  }
});

// GET /assignments/:id
router.get('/assignments/:id', authenticateToken, async (req, res, next) => {
  try {
    const assignment = await database.getDB().collection('assignments').findOne({ _id: new ObjectId(req.params.id) });
    if (assignment) {
      res.status(200).json(assignment);
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  } catch (err) {
    next(err);
  }
});

// PATCH /assignments/:id
router.patch('/assignments/:id', authenticateToken, async (req, res, next) => {
  const { role, id: userId } = req.user;
  const assignmentId = req.params.id;

  if (role !== 'admin' && !(role === 'instructor' && await matchesCourseInstructor(userId, assignmentId))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (validateAgainstSchema(req.body, assignmentSchema, false)) {
    try {
      const result = await database.getDB().collection('assignments').updateOne(
        { _id: new ObjectId(assignmentId) },
        { $set: extractValidFields(req.body, assignmentSchema) }
      );

      if (result.matchedCount > 0) {
        res.status(200).json({ links: { assignment: `/assignments/${assignmentId}` } });
      } else {
        res.status(404).json({ error: 'Assignment not found' });
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).json({ error: 'Invalid request body' });
  }
});

// DELETE /assignments/:id
router.delete('/assignments/:id', authenticateToken, async (req, res, next) => {
  const { role, id: userId } = req.user;
  const assignmentId = req.params.id;

  if (role !== 'admin' && !(role === 'instructor' && await matchesCourseInstructor(userId, assignmentId))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const result = await database.getDB().collection('assignments').deleteOne({ _id: new ObjectId(assignmentId) });
    if (result.deletedCount > 0) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  } catch (err) {
    next(err);
  }
});

// GET /assignments/:id/submissions
router.get('/assignments/:id/submissions', authenticateToken, async (req, res, next) => {
  const { role, id: userId } = req.user;
  const assignmentId = req.params.id;

  if (role !== 'admin' && !(role === 'instructor' && await matchesCourseInstructor(userId, assignmentId))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const studentIdFilter = req.query.studentId ? { studentId: req.query.studentId } : {};

  try {
    const db = database.getDB();
    const submissions = await db.collection('submissions')
      .find({ assignmentId, ...studentIdFilter })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    const count = await db.collection('submissions').countDocuments({ assignmentId, ...studentIdFilter });
    const totalPages = Math.ceil(count / pageSize);

    res.status(200).json({ submissions, page, totalPages, pageSize, count });
  } catch (err) {
    next(err);
  }
});

// POST /assignments/:id/submissions
router.post('/assignments/:id/submissions', authenticateToken, async (req, res, next) => {
  const { role, id: userId } = req.user;
  const assignmentId = req.params.id;

  if (role !== 'student') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const db = database.getDB();
  const enrollment = await db.collection('enrollments').findOne({ studentId: userId, courseId: req.body.courseId });
  
  if (!enrollment) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (validateAgainstSchema(req.body, submissionSchema)) {
    const submission = extractValidFields(req.body, submissionSchema);
    try {
      const result = await db.collection('submissions').insertOne(submission);
      res.status(201).json({
        _id: result.insertedId,
        links: {
          submission: `/assignments/${assignmentId}/submissions/${result.insertedId}`
        }
      });
    } catch (err) {
      next(err);
    }
  } else {
    res.status(400).json({ error: 'Invalid Submission object' });
  }
});

module.exports = router;