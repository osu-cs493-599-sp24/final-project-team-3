const express = require('express');
const { Assignment } = require('../models/assignments');
const authenticate = require('../middleware/authenticator');
const authorize = require('../middleware/authorization');

const router = express.Router();

// POST /assignments
router.post('/', authenticate, authorize(['admin', 'instructor']), async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create assignment.' });
  }
});

// GET /assignments/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (assignment) {
      res.status(200).json(assignment);
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /assignments/:id
router.patch('/:id', authenticate, authorize(['admin', 'instructor']), async (req, res) => {
  try {
    const [updated] = await Assignment.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedAssignment = await Assignment.findByPk(req.params.id);
      res.status(200).json(updatedAssignment);
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update assignment.' });
  }
});

// DELETE /assignments/:id
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const deleted = await Assignment.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete assignment.' });
  }
});

module.exports = router;
