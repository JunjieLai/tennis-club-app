const { Challenge, Member, Match } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private (Admin)
exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      include: [
        { model: Member, as: 'Challenger', attributes: ['MEID', 'UserName', 'MPID'] },
        { model: Member, as: 'Challenged', attributes: ['MEID', 'UserName', 'MPID'] }
      ],
      order: [['DateOfChallenge', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: challenges.length,
      challenges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get challenges for current user
// @route   GET /api/challenges/me
// @access  Private
exports.getMyChallenges = async (req, res) => {
  try {
    const memberId = req.user.MEID;

    // Get challenges received (waiting for response)
    const challengesReceived = await Challenge.findAll({
      where: {
        ChallengedMEID: memberId,
        State: 'Wait'
      },
      include: [
        { model: Member, as: 'Challenger', attributes: ['MEID', 'UserName', 'MPID', 'UTR'] }
      ],
      order: [['DateOfChallenge', 'DESC']]
    });

    // Get challenges sent
    const challengesSent = await Challenge.findAll({
      where: {
        ChallengerMEID: memberId
      },
      include: [
        { model: Member, as: 'Challenged', attributes: ['MEID', 'UserName', 'MPID', 'UTR'] }
      ],
      order: [['DateOfChallenge', 'DESC']]
    });

    res.status(200).json({
      success: true,
      challengesReceived,
      challengesSent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new challenge
// @route   POST /api/challenges
// @access  Private
exports.createChallenge = async (req, res) => {
  try {
    const { challengedMEID, notes, matchDateTime } = req.body;
    const challengerMEID = req.user.MEID;

    // Validate match date time
    if (!matchDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Match date and time is required'
      });
    }

    const matchDate = new Date(matchDateTime);
    if (matchDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Match date must be in the future'
      });
    }

    // Check if challenging self
    if (challengerMEID === parseInt(challengedMEID)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot challenge yourself'
      });
    }

    // Check if challenged member exists
    const challengedMember = await Member.findByPk(challengedMEID);
    if (!challengedMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check for existing challenge on the same day (pending or accepted)
    const matchDateStart = new Date(matchDate);
    matchDateStart.setHours(0, 0, 0, 0);

    const matchDateEnd = new Date(matchDate);
    matchDateEnd.setHours(23, 59, 59, 999);

    const existingChallenge = await Challenge.findOne({
      where: {
        [Op.or]: [
          {
            ChallengerMEID: challengerMEID,
            ChallengedMEID: challengedMEID
          },
          {
            ChallengerMEID: challengedMEID,
            ChallengedMEID: challengerMEID
          }
        ],
        State: {
          [Op.in]: ['Wait', 'Accept']
        },
        MatchDateTime: {
          [Op.between]: [matchDateStart, matchDateEnd]
        }
      }
    });

    if (existingChallenge) {
      return res.status(400).json({
        success: false,
        message: 'You already have a challenge with this member on this date'
      });
    }

    const challenge = await Challenge.create({
      ChallengerMEID: challengerMEID,
      ChallengedMEID: challengedMEID,
      State: 'Wait',
      DateOfChallenge: new Date(),
      MatchDateTime: matchDate,
      Notes: notes || ''
    });

    const challengeWithDetails = await Challenge.findByPk(challenge.CID, {
      include: [
        { model: Member, as: 'Challenger', attributes: ['MEID', 'UserName', 'MPID'] },
        { model: Member, as: 'Challenged', attributes: ['MEID', 'UserName', 'MPID'] }
      ]
    });

    res.status(201).json({
      success: true,
      challenge: challengeWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Accept challenge
// @route   PUT /api/challenges/:id/accept
// @access  Private
exports.acceptChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByPk(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user is the challenged member
    if (challenge.ChallengedMEID !== req.user.MEID) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this challenge'
      });
    }

    if (challenge.State !== 'Wait') {
      return res.status(400).json({
        success: false,
        message: 'Challenge has already been responded to'
      });
    }

    challenge.State = 'Accept';
    await challenge.save();

    // Create a pending match when challenge is accepted
    const match = await Match.create({
      CID: challenge.CID,
      DateOfMatch: challenge.MatchDateTime,
      Status: 'pending',
      Player1MEID: challenge.ChallengerMEID,
      Player2MEID: challenge.ChallengedMEID,
      MEID1Set1Score: null,
      MEID2Set1Score: null,
      WinnerMEID: null,
      LoserMEID: null
    });

    res.status(200).json({
      success: true,
      challenge,
      match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reject challenge
// @route   PUT /api/challenges/:id/reject
// @access  Private
exports.rejectChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByPk(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user is the challenged member
    if (challenge.ChallengedMEID !== req.user.MEID) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this challenge'
      });
    }

    if (challenge.State !== 'Wait') {
      return res.status(400).json({
        success: false,
        message: 'Challenge has already been responded to'
      });
    }

    challenge.State = 'Reject';
    await challenge.save();

    res.status(200).json({
      success: true,
      challenge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get accepted challenges (for admin to create matches)
// @route   GET /api/challenges/accepted
// @access  Private (Admin)
exports.getAcceptedChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.findAll({
      where: { State: 'Accept' },
      include: [
        { model: Member, as: 'Challenger', attributes: ['MEID', 'UserName', 'MPID'] },
        { model: Member, as: 'Challenged', attributes: ['MEID', 'UserName', 'MPID'] }
      ],
      order: [['DateOfChallenge', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: challenges.length,
      challenges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
