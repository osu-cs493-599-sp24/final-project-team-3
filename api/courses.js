const { Router } = require('express');
const { ValidationError } = require('sequelize');
const { Course, CourseClientFields } = require('../models/course');

const router = Router();

/*
 * Route to create a new course.
 */
router.post('/', async function (req, res, next) {
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
 * Route to fetch info about a specific course.
 */
router.get('/:courseId', async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findByPk(courseId);
    if (course) {
      res.status(200).send(course);
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to update a course.
 */
router.patch('/:courseId', async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    /*
     * Update course fields.
     */
    const result = await Course.update(req.body, {
      where: { id: courseId },
      fields: CourseClientFields
    });
    if (result[0] > 0) {
      res.status(204).send();
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});

/*
 * Route to delete a course.
 */
router.delete('/:courseId', async function (req, res, next) {
  const courseId = req.params.courseId;
  try {
    const result = await Course.destroy({ where: { id: courseId }});
    if (result > 0) {
      res.status(204).send();
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
