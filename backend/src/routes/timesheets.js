const express = require('express');
const { auth, managerOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Timesheet routes
router.get('/', auth, (req, res) => {
  res.json({ message: 'Timesheet routes - Get all timesheets' });
});

router.get('/:id', auth, (req, res) => {
  res.json({ message: `Timesheet routes - Get timesheet ${req.params.id}` });
});

router.post('/', auth, (req, res) => {
  res.json({ message: 'Timesheet routes - Create new timesheet entry' });
});

router.put('/:id', auth, (req, res) => {
  res.json({ message: `Timesheet routes - Update timesheet ${req.params.id}` });
});

router.patch('/:id/clock-in', auth, (req, res) => {
  res.json({ message: `Timesheet routes - Clock in for timesheet ${req.params.id}` });
});

router.patch('/:id/clock-out', auth, (req, res) => {
  res.json({ message: `Timesheet routes - Clock out for timesheet ${req.params.id}` });
});

router.patch('/:id/approve', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: `Timesheet routes - Approve timesheet ${req.params.id}` });
});

router.patch('/:id/reject', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: `Timesheet routes - Reject timesheet ${req.params.id}` });
});

module.exports = router;