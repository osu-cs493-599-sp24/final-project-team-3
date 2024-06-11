const express = require('express');
const fs = require('fs');
const path = require('path');
const { Submission, Assignment, Course } = require('../models');
const authenticateToken = require('../middleware/authenticator');
const upload = require('../middleware/uploadConfig');  // Adjust the path as necessary

const router = express.Router();

// Route to update a submission
router.patch('/:id', authenticateToken, upload.single('file'), async (req, res) => {
  const submissionId = req.params.id;
  const { user } = req;
  const updateData = req.body;

  // Incorporate file data into updateData if file is uploaded
  if (req.file) {
    updateData.filePath = req.file.path;
    updateData.fileName = req.file.filename;
    updateData.mimeType = req.file.mimetype;
  }

  try {
    const submission = await Submission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const assignment = await Assignment.findByPk(submission.assignmentId);
    const course = await Course.findByPk(assignment.courseId);

    // Check authorization
    if (user.role !== 'admin' && user.id !== course.instructorId) {
      return res.status(403).json({ error: 'Unauthorized user' });
    }

    // Update the submission with new data
    await submission.update(updateData);
    console.log('Updated submission:', submission.toJSON());

    res.status(200).json({
      message: 'Submission updated successfully',
      submission: submission
    });
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
    // Construct file path and check if the file exists
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (!fs.existsSync(filePath)) {
      console.error('File not found at:', filePath);
      return res.status(404).json({ error: 'Submission file not found' });
    }

    // Find the submission by filename
    const submission = await Submission.findOne({ where: { filename } });
    if (!submission) {
      console.error('No database entry for filename:', filename);
      return res.status(404).json({ error: 'Submission file not found' });
    }

    // Authorization check for admin or matching instructor ID
    const assignment = await Assignment.findByPk(submission.assignmentId);
    const course = await Course.findByPk(assignment.courseId);
    if (user.role !== 'admin' && user.id !== course.instructorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Read and send the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log('Submission file content:', fileContent);
    res.status(200).send(fileContent);
  } catch (error) {
    console.error('Error fetching submission file:', error);
    res.status(500).json({ error: 'An error occurred while fetching the submission file' });
  }
});


module.exports = router;
