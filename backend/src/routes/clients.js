const express = require('express');
const { auth, managerOrAdmin, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats,
  updateClientStatus
} = require('../controllers/clientController');

const router = express.Router();

// Client management routes
router.get('/', auth, getAllClients);
router.get('/stats', auth, getClientStats);
router.get('/:id', auth, getClientById);
router.post('/', [auth, managerOrAdmin], createClient);
router.put('/:id', [auth, managerOrAdmin], updateClient);
router.patch('/:id/status', [auth, managerOrAdmin], updateClientStatus);
router.delete('/:id', [auth, adminOnly], deleteClient);

// Related data routes (placeholders for future integration)
router.get('/:id/jobs', auth, (req, res) => {
  res.json({ message: `Jobs for client ${req.params.id} - Integration pending` });
});

router.get('/:id/quotes', auth, (req, res) => {
  res.json({ message: `Quotes for client ${req.params.id} - Integration pending` });
});

module.exports = router;