const express = require('express');
const router = express.Router();
const {
  getAllMatches,
  getMatchById,
  getMemberMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  getFinishedMatches,
  gradeMatch,
  updateMatchStatuses,
  getMatchStats
} = require('../controllers/matchController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getAllMatches);
router.get('/stats', protect, adminOnly, getMatchStats);
router.get('/finished', protect, adminOnly, getFinishedMatches);
router.get('/member/:id', protect, getMemberMatches);
router.get('/:id', protect, getMatchById);
router.post('/', protect, adminOnly, createMatch);
router.put('/update-status', protect, adminOnly, updateMatchStatuses);
router.put('/:id/grade', protect, adminOnly, gradeMatch);
router.put('/:id', protect, adminOnly, updateMatch);
router.delete('/:id', protect, adminOnly, deleteMatch);

module.exports = router;
