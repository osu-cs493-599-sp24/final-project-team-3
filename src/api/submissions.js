const express = require('express');
const fs = require('fs');
const path = require('path');
const { Submission, Assignment, Course } = require('../models');
const authenticateToken = require('../middleware/authenticator');

const router = express.Router();

// Route to update a submission
router.patch('/:id', authenticateToken, async (req, res) => {
  const submissionId = req.params.id;
  const { user } = req;
  const updateData = req.body;

  try {
    const submission = await Submission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const assignment = await Assignment.findByPk(submission.assignmentId);
    const course = await Course.findByPk(assignment.courseId);

    if (user.role !== 'admin' && user.id !== course.instructorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await submission.update(updateData);
    console.log('Updated submission:', submission.toJSON());

    res.status(200).json(submission);
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'An error occurred while updating the submission' });
  }
});

// Route to download submission file
router.get('/media/:filename', authenticateToken, async (req, res) => {
  const { filename } = req.params;
  const { user } = req;

  try {
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Submission file not found' });
    }

    const submission = await Submission.findOne({ where: { filename } });
    if (!submission) {
      return res.status(404).json({ error: 'Submission file not found' });
    }

    const assignment = await Assignment.findByPk(submission.assignmentId);
    const course = await Course.findByPk(assignment.courseId);

    if (user.role !== 'admin' && user.id !== course.instructorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log('Submission file content:', fileContent);

    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Error fetching submission file:', error);
    res.status(500).json({ error: 'An error occurred while fetching the submission file' });
  }
});

module.exports = router;
