const express = require('express');
const { auth, managerOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Quote management routes
router.get('/', auth, (req, res) => {
  res.json({ message: 'Quote routes - Get all quotes' });
});

router.get('/:id', auth, (req, res) => {
  res.json({ message: `Quote routes - Get quote ${req.params.id}` });
});

router.post('/', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: 'Quote routes - Create new quote' });
});

router.put('/:id', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: `Quote routes - Update quote ${req.params.id}` });
});

router.post('/:id/send', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: `Quote routes - Send quote ${req.params.id} to client` });
});

router.patch('/:id/accept', auth, (req, res) => {
  res.json({ message: `Quote routes - Accept quote ${req.params.id}` });
});

router.patch('/:id/reject', auth, (req, res) => {
  res.json({ message: `Quote routes - Reject quote ${req.params.id}` });
});

router.post('/:id/convert', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: `Quote routes - Convert quote ${req.params.id} to job` });
});

module.exports = router;