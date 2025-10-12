const express = require('express');
const router = express.Router();
const {
  getAllChallenges,
  getMyChallenges,
  createChallenge,
  acceptChallenge,
  rejectChallenge,
  getAcceptedChallenges
} = require('../controllers/challengeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getAllChallenges);
router.get('/me', protect, getMyChallenges);
router.get('/accepted', protect, adminOnly, getAcceptedChallenges);
router.post('/', protect, createChallenge);
router.put('/:id/accept', protect, acceptChallenge);
router.put('/:id/reject', protect, rejectChallenge);

module.exports = router;
