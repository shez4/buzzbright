const express = require('express');
const { auth, managerOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Client management routes
router.get('/', auth, (req, res) => {
  res.json({ message: 'Client routes - Get all clients' });
});

router.get('/:id', auth, (req, res) => {
  res.json({ message: `Client routes - Get client ${req.params.id}` });
});

router.post('/', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: 'Client routes - Create new client' });
});

router.put('/:id', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: `Client routes - Update client ${req.params.id}` });
});

router.delete('/:id', [auth, managerOrAdmin], (req, res) => {
  res.json({ message: `Client routes - Delete client ${req.params.id}` });
});

router.get('/:id/jobs', auth, (req, res) => {
  res.json({ message: `Client routes - Get jobs for client ${req.params.id}` });
});

router.get('/:id/quotes', auth, (req, res) => {
  res.json({ message: `Client routes - Get quotes for client ${req.params.id}` });
});

module.exports = router;