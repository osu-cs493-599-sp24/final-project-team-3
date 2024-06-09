const { Router } = require('express');
const { ValidationError } = require('sequelize');
const { Course, CourseClientFields } = require('../models/courses');
const CourseEnrollments = require('../models/enrollments');
const User = require('../models/users');
const authenticateToken = require('../middleware/authenticator');
const authorizeRole = require('../middleware/authorization');
const { Parser } = require('json2csv');

const router = Router();

/*
 * Route to create a new course.
 */
router.post('/courses', authenticateToken, authorizeRole('admin'), async function (req, res, next) {
  try {
    const course = await Course.create(req.body, CourseClientFields);
    res.status(201).send({ id: course.id });
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).json({ error: 'The request body was either not present or did not contain a valid Course object.' });
    } else {
      next(e);
    }
  }
});

/*
 * Route to fetch the list of all courses (paginated).
 */
router.get('/courses', async function (req, res, next) {
  const { page = 1, pageSize = 10, subject, number, term } = req.query;
  const whereClause = {};

  if (subject) {
    whereClause.subject = subject;
  }
  if (number) {
    whereClause.number = number;
  }
  if (term) {
    whereClause.term = term;
  }

  try {
    const { count, rows } = await Course.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset: (page - 1) * pageSize
    });
    res.status(200).send({
      courses: rows,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / pageSize)
    });
  } catch (e) {
    next(e);
  }
});

/*
 * Route to fetch info about a specific course.
 */
router.get('/courses/:courseId', async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findByPk(courseId);
    if (course) {
      res.status(200).send(course);
    } else {
      res.status(404).json({ error: 'Specified Course `id` not found.' });
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to update a course.
 */
router.patch('/courses/:courseId', authenticateToken, async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Specified Course `id` not found.' });
    }
    if (req.user.role !== 'admin' && req.user.id !== course.instructorId) {
      return res.status(403).json({ error: 'The request was not made by an authenticated User satisfying the authorization criteria described above.' });
    }
    const result = await Course.update(req.body, {
      where: { id: courseId },
      fields: CourseClientFields
    });
    if (result[0] > 0) {
      res.status(200).send(course);
    } else {
      res.status(400).json({ error: 'The request body was either not present or did not contain any fields related to Course objects.' });
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to delete a course.
 */
router.delete('/courses/:courseId', authenticateToken, authorizeRole('admin'), async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const result = await Course.destroy({ where: { id: courseId }});
    if (result > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Specified Course `id` not found.' });
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to fetch students enrolled in a course.
 */
router.get('/courses/:courseId/students', authenticateToken, async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findByPk(courseId, {
      include: {
        model: User,
        as: 'students',
        attributes: ['id', 'username', 'role']
      }
    });
    if (course) {
      if (req.user.role !== 'admin' && req.user.id !== course.instructorId) {
        return res.status(403).json({ error: 'The request was not made by an authenticated User satisfying the authorization criteria described above.' });
      }
      res.status(200).send(course.students);
    } else {
      res.status(404).json({ error: 'Specified Course `id` not found.' });
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to update enrollment for a course.
 */
router.post('/courses/:courseId/students', authenticateToken, async function (req, res, next) {
  const courseId = req.params.courseId;
  const { add, remove } = req.body;
  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Specified Course `id` not found.' });
    }
    if (req.user.role !== 'admin' && req.user.id !== course.instructorId) {
      return res.status(403).json({ error: 'The request was not made by an authenticated User satisfying the authorization criteria described above.' });
    }
    if (!add && !remove) {
      return res.status(400).json({ error: 'The request body was either not present or did not contain the fields described above.' });
    }

    if (add && add.length > 0) {
      const enrollments = add.map((studentId) => ({ courseId, userId: studentId }));
      await CourseEnrollments.bulkCreate(enrollments);
    }
    if (remove && remove.length > 0) {
      await CourseEnrollments.destroy({ where: { courseId, userId: remove } });
    }

    res.status(200).send({ message: 'Enrollments updated' });
  } catch (e) {
    next(e);
  }
});

/*
 * Route to fetch the roster of a course in CSV format.
 */
router.get('/courses/:courseId/roster', authenticateToken, async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findByPk(courseId, {
      include: {
        model: User,
        as: 'students',
        attributes: ['id', 'username']
      }
    });
    if (course) {
      if (req.user.role !== 'admin' && req.user.id !== course.instructorId) {
        return res.status(403).json({ error: 'The request was not made by an authenticated User satisfying the authorization criteria described above.' });
      }
      const parser = new Parser({ fields: ['id', 'username'] });
      const csv = parser.parse(course.students);
      res.header('Content-Type', 'text/csv');
      res.attachment(`roster_course_${courseId}.csv`);
      res.status(200).send(csv);
    } else {
      res.status(404).json({ error: 'Specified Course `id` not found.' });
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to fetch assignments for a course.
 */
router.get('/courses/:courseId/assignments', async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findByPk(courseId, {
      include: {
        model: Assignment,
        as: 'assignments'
      }
    });
    if (course) {
      res.status(200).send(course.assignments);
    } else {
      res.status(404).json({ error: 'Specified Course `id` not found.' });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
