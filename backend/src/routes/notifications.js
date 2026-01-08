const express = require('express');
const { auth, managerOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Notification routes
router.get('/', auth, (req, res) => {
  res.json({ message: 'Notification routes - Get user notifications' });
});

router.get('/:id', auth, (req, res) => {
  res.json({ message: `Notification routes - Get notification ${req.params.id}` });
});

router.patch('/:id/read', auth, (req, res) => {
  res.json({ message: `Notification routes - Mark notification ${req.params.id} as read` });
});

router.patch('/mark-all-read', auth, (req, res) => {
  res.json({ message: 'Notification routes - Mark all notifications as read' });
});

router.delete('/:id', auth, (req, res) => {
  res.json({ message: `Notification routes - Delete notification ${req.params.id}` });
});

router.get('/preferences', auth, (req, res) => {
  res.json({ message: 'Notification routes - Get user notification preferences' });
});

router.put('/preferences', auth, (req, res) => {
  res.json({ message: 'Notification routes - Update user notification preferences' });
});

// Admin routes for sending notifications
router.post('/send', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: 'Notification routes - Send notification to users' });
});

router.get('/templates', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: 'Notification routes - Get notification templates' });
});

module.exports = router;