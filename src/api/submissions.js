const { Router } = require('express');
const { Submission } = require('../models/submissions'); // Assuming you have a model set up

const router = Router();

/*
 * Route to update a specific Submission.
 * Only an authenticated User with 'admin' role or an authenticated 'instructor' whose ID matches the Course's instructorId can update a Submission.
 */
router.patch('/:submissionId', authenticate, authorize(['admin', 'instructor']), async function (req, res, next) {
    const { submissionId } = req.params;
    try {
        const submission = await Submission.findByPk(submissionId);
        if (!submission) {
            return res.status(404).send({ error: 'Submission not found' });
        }

        // Check if instructor is allowed to update
        if (req.user.role === 'instructor' && req.user.id !== submission.instructorId) {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        // Perform update, only allow certain fields to be updated
        const updated = await Submission.update(req.body, {
            where: { id: submissionId },
            fields: ['grade'] // Assuming only grade can be updated
        });

        if (updated) {
            res.status(200).send({ message: 'Submission updated successfully' });
        } else {
            next();
        }
    } catch (e) {
        next(e);
    }
});

/*
 * Route to download a file for a specific Submission.
 * Only an authenticated User with 'admin' role or an authenticated 'instructor' whose ID matches the Course's instructorId can download a Submission file.
 */
router.get('/media/submissions/:filename', authenticate, authorize(['admin', 'instructor']), async function (req, res, next) {
    const { filename } = req.params;
    try {
        // Example file retrieval logic
        const filePath = `/path/to/submissions/${filename}`;
        const fileExists = true; // Placeholder for actual file existence check

        if (!fileExists) {
            return res.status(404).send({ error: 'Submission file not found' });
        }

        res.download(filePath);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
