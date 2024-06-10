const { Router } = require('express');
const { Submission, Assignment, Course } = require('../models');
const authenticateToken = require('../middleware/authenticator');

const router = Router();

/*
 * PATCH /submissions/:id
 * Update data for a specific Submission.
 */
router.patch('/submissions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const submission = await Submission.findByPk(id);
    if (!submission) {
      return res.status(404).json({ error: 'Specified Submission id not found' });
    }

    const assignment = await Assignment.findByPk(submission.assignmentId);
    const course = await Course.findByPk(assignment.courseId);

    // Check if the user is admin or the instructor of the course
    if (req.user.role !== 'admin' && req.user.id !== course.instructorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await submission.update(updates);
    res.status(200).json(submission);
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/*
 * GET /media/submissions/:filename
 * Download the file for a specific Submission.
 */
router.get('/media/submissions/:filename', authenticateToken, async (req, res) => {
  const { filename } = req.params;

  try {
    const submission = await Submission.findOne({ where: { filename } });
    if (!submission) {
      return res.status(404).json({ error: 'Specified Submission file not found' });
    }

    const assignment = await Assignment.findByPk(submission.assignmentId);
    const course = await Course.findByPk(assignment.courseId);

    // Check if the user is admin or the instructor of the course
    if (req.user.role !== 'admin' && req.user.id !== course.instructorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.download(submission.path, submission.filename);
  } catch (error) {
    console.error('Error downloading submission file:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
