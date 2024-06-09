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
router.post('/', authenticateToken, authorizeRole('admin'), async function (req, res, next) {
  try {
    const course = await Course.create(req.body, CourseClientFields);
    res.status(201).send({ id: course.id });
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message });
    } else {
      next(e);
    }
  }
});

/*
 * Route to fetch the list of all courses (paginated).
 */
router.get('/', async function (req, res, next) {
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
router.get('/:courseId', async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findByPk(courseId);
    if (course) {
      res.status(200).send(course);
    } else {
      res.status(404).send({ error: 'Course not found' });
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to update a course.
 */
router.patch('/:courseId', authenticateToken, async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).send({ error: 'Course not found' });
    }
    if (req.user.role !== 'admin' && req.user.id !== course.instructorId) {
      return res.status(403).send({ error: 'Unauthorized' });
    }
    const result = await Course.update(req.body, {
      where: { id: courseId },
      fields: CourseClientFields
    });
    if (result[0] > 0) {
      res.status(200).send(course);
    } else {
      res.status(404).send({ error: 'Course not found' });
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to delete a course.
 */
router.delete('/:courseId', authenticateToken, authorizeRole('admin'), async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const result = await Course.destroy({ where: { id: courseId }});
    if (result > 0) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: 'Course not found' });
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to fetch students enrolled in a course.
 */
router.get('/:courseId/students', authenticateToken, async function (req, res, next) {
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
        return res.status(403).send({ error: 'Unauthorized' });
      }
      res.status(200).send(course.students);
    } else {
      res.status(404).send({ error: 'Course not found' });
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to update enrollment for a course.
 */
router.post('/:courseId/students', authenticateToken, async function (req, res, next) {
  const courseId = req.params.courseId;
  const { studentIds } = req.body;
  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).send({ error: 'Course not found' });
    }
    if (req.user.role !== 'admin' && req.user.id !== course.instructorId) {
      return res.status(403).send({ error: 'Unauthorized' });
    }
    await CourseEnrollments.destroy({ where: { courseId } });
    const enrollments = studentIds.map((studentId) => ({ courseId, userId: studentId }));
    await CourseEnrollments.bulkCreate(enrollments);
    res.status(200).send({ message: 'Enrollments updated' });
  } catch (e) {
    next(e);
  }
});

/*
 * Route to fetch the roster of a course in CSV format.
 */
router.get('/:courseId/roster', authenticateToken, async function (req, res, next) {
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
        return res.status(403).send({ error: 'Unauthorized' });
      }
      const parser = new Parser({ fields: ['id', 'username'] });
      const csv = parser.parse(course.students);
      res.header('Content-Type', 'text/csv');
      res.attachment(`roster_course_${courseId}.csv`);
      res.status(200).send(csv);
    } else {
      res.status(404).send({ error: 'Course not found' });
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to fetch assignments for a course.
 */
router.get('/:courseId/assignments', async function (req, res, next) {
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
      res.status(404).send({ error: 'Course not found' });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
