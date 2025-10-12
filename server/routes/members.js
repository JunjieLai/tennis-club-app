const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  getMemberStats,
  getBestChallengers,
  getTopPlayers,
  getMostActivePlayers,
  getMemberAnalytics,
  deleteMember,
  updateMember
} = require('../controllers/memberController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getAllMembers);
router.get('/analytics/stats', protect, adminOnly, getMemberAnalytics);
router.get('/top/:limit', protect, getTopPlayers);
router.get('/active/:limit', protect, getMostActivePlayers);
router.get('/:id', protect, getMemberById);
router.get('/:id/stats', protect, getMemberStats);
router.get('/:id/challengers', protect, getBestChallengers);
router.put('/:id', protect, updateMember);
router.delete('/:id', protect, adminOnly, deleteMember);

module.exports = router;
