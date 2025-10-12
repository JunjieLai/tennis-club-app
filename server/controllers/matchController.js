const { Match, Member, Challenge } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all matches
// @route   GET /api/matches
// @access  Private
exports.getAllMatches = async (req, res) => {
  try {
    const matches = await Match.findAll({
      include: [
        { model: Member, as: 'Player1', attributes: ['MEID', 'UserName', 'FirstName', 'LastName', 'MPID', 'UTR'] },
        { model: Member, as: 'Player2', attributes: ['MEID', 'UserName', 'FirstName', 'LastName', 'MPID', 'UTR'] },
        { model: Member, as: 'Winner', attributes: ['MEID', 'UserName', 'MPID'] },
        { model: Member, as: 'Loser', attributes: ['MEID', 'UserName', 'MPID'] }
      ],
      order: [['DateOfMatch', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get match by ID
// @route   GET /api/matches/:id
// @access  Private
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id, {
      include: [
        { model: Member, as: 'Winner', attributes: ['MEID', 'UserName', 'FirstName', 'LastName', 'MPID'] },
        { model: Member, as: 'Loser', attributes: ['MEID', 'UserName', 'FirstName', 'LastName', 'MPID'] }
      ]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Calculate match summary
    const summary = calculateMatchSummary(match);

    res.status(200).json({
      success: true,
      match,
      summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get matches for a member
// @route   GET /api/matches/member/:id
// @access  Private
exports.getMemberMatches = async (req, res) => {
  try {
    const memberId = req.params.id;
    const { status, period, result } = req.query;

    let whereClause = {
      [Op.or]: [
        { Player1MEID: memberId },
        { Player2MEID: memberId }
      ]
    };

    // Filter by status (only show graded matches in history)
    if (status === 'history') {
      whereClause.Status = 'graded';
    } else if (status === 'upcoming') {
      whereClause.Status = 'pending';
    }

    // Filter by time period
    if (period) {
      const now = new Date();
      let startDate;

      if (period === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (period === 'month') {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      } else if (period === 'quarter') {
        startDate = new Date(now.setMonth(now.getMonth() - 3));
      }

      if (startDate) {
        whereClause.DateOfMatch = { [Op.gte]: startDate };
      }
    }

    // Filter by result (win/loss)
    if (result === 'win') {
      whereClause.WinnerMEID = memberId;
    } else if (result === 'loss') {
      whereClause.LoserMEID = memberId;
    }

    const matches = await Match.findAll({
      where: whereClause,
      include: [
        { model: Member, as: 'Player1', attributes: ['MEID', 'UserName', 'FirstName', 'LastName', 'MPID', 'UTR'], required: false },
        { model: Member, as: 'Player2', attributes: ['MEID', 'UserName', 'FirstName', 'LastName', 'MPID', 'UTR'], required: false },
        { model: Member, as: 'Winner', attributes: ['MEID', 'UserName', 'MPID'], required: false },
        { model: Member, as: 'Loser', attributes: ['MEID', 'UserName', 'MPID'], required: false }
      ],
      order: [['DateOfMatch', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create match from challenge
// @route   POST /api/matches
// @access  Private (Admin)
exports.createMatch = async (req, res) => {
  try {
    const {
      CID,
      MEID1Set1Score,
      MEID2Set1Score,
      MEID1Set2Score,
      MEID2Set2Score,
      MEID1Set3Score,
      MEID2Set3Score
    } = req.body;

    // Get challenge
    const challenge = await Challenge.findByPk(CID);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (challenge.State !== 'Accept') {
      return res.status(400).json({
        success: false,
        message: 'Challenge must be accepted before creating a match'
      });
    }

    // Calculate winner
    let set1Winner = MEID1Set1Score > MEID2Set1Score ? 1 : 2;
    let set2Winner = MEID1Set2Score > MEID2Set2Score ? 1 : 2;
    let set3Winner = MEID1Set3Score > MEID2Set3Score ? 1 : 2;

    let player1Sets = 0;
    if (set1Winner === 1) player1Sets++;
    if (set2Winner === 1) player1Sets++;
    if (set3Winner === 1) player1Sets++;

    const WinnerMEID = player1Sets >= 2 ? challenge.ChallengerMEID : challenge.ChallengedMEID;
    const LoserMEID = player1Sets >= 2 ? challenge.ChallengedMEID : challenge.ChallengerMEID;

    // Create match
    const match = await Match.create({
      CID,
      DateOfMatch: challenge.DateOfChallenge,
      MEID1Set1Score,
      MEID2Set1Score,
      MEID1Set2Score,
      MEID2Set2Score,
      MEID1Set3Score,
      MEID2Set3Score,
      WinnerMEID,
      LoserMEID
    });

    // Update challenge state
    challenge.State = 'Added';
    await challenge.save();

    const matchWithDetails = await Match.findByPk(match.MAID, {
      include: [
        { model: Member, as: 'Winner', attributes: ['MEID', 'UserName', 'MPID'] },
        { model: Member, as: 'Loser', attributes: ['MEID', 'UserName', 'MPID'] }
      ]
    });

    res.status(201).json({
      success: true,
      match: matchWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update match
// @route   PUT /api/matches/:id
// @access  Private (Admin)
exports.updateMatch = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const {
      MEID1Set1Score,
      MEID2Set1Score,
      MEID1Set2Score,
      MEID2Set2Score,
      MEID1Set3Score,
      MEID2Set3Score
    } = req.body;

    // Update scores
    if (MEID1Set1Score !== undefined) match.MEID1Set1Score = MEID1Set1Score;
    if (MEID2Set1Score !== undefined) match.MEID2Set1Score = MEID2Set1Score;
    if (MEID1Set2Score !== undefined) match.MEID1Set2Score = MEID1Set2Score;
    if (MEID2Set2Score !== undefined) match.MEID2Set2Score = MEID2Set2Score;
    if (MEID1Set3Score !== undefined) match.MEID1Set3Score = MEID1Set3Score;
    if (MEID2Set3Score !== undefined) match.MEID2Set3Score = MEID2Set3Score;

    // Recalculate winner
    const summary = calculateMatchSummary(match);
    const challenge = await Challenge.findByPk(match.CID);

    if (summary[0] > summary[1]) {
      match.WinnerMEID = challenge.ChallengerMEID;
      match.LoserMEID = challenge.ChallengedMEID;
    } else {
      match.WinnerMEID = challenge.ChallengedMEID;
      match.LoserMEID = challenge.ChallengerMEID;
    }

    await match.save();

    const updatedMatch = await Match.findByPk(match.MAID, {
      include: [
        { model: Member, as: 'Winner', attributes: ['MEID', 'UserName', 'MPID'] },
        { model: Member, as: 'Loser', attributes: ['MEID', 'UserName', 'MPID'] }
      ]
    });

    res.status(200).json({
      success: true,
      match: updatedMatch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete match
// @route   DELETE /api/matches/:id
// @access  Private (Admin)
exports.deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    await match.destroy();

    res.status(200).json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get finished matches awaiting grading
// @route   GET /api/matches/finished
// @access  Private (Admin)
exports.getFinishedMatches = async (req, res) => {
  try {
    const matches = await Match.findAll({
      where: { Status: 'finished' },
      include: [
        { model: Member, as: 'Player1', attributes: ['MEID', 'UserName', 'FirstName', 'LastName', 'MPID', 'UTR'] },
        { model: Member, as: 'Player2', attributes: ['MEID', 'UserName', 'FirstName', 'LastName', 'MPID', 'UTR'] }
      ],
      order: [['DateOfMatch', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Grade a finished match
// @route   PUT /api/matches/:id/grade
// @access  Private (Admin)
exports.gradeMatch = async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    if (match.Status !== 'finished') {
      return res.status(400).json({
        success: false,
        message: 'Can only grade finished matches'
      });
    }

    const {
      MEID1Set1Score,
      MEID2Set1Score,
      MEID1Set2Score,
      MEID2Set2Score,
      MEID1Set3Score,
      MEID2Set3Score
    } = req.body;

    // Update scores
    match.MEID1Set1Score = MEID1Set1Score;
    match.MEID2Set1Score = MEID2Set1Score;
    match.MEID1Set2Score = MEID1Set2Score || null;
    match.MEID2Set2Score = MEID2Set2Score || null;
    match.MEID1Set3Score = MEID1Set3Score || null;
    match.MEID2Set3Score = MEID2Set3Score || null;

    // Calculate winner based on sets won
    let player1Sets = 0;
    let player2Sets = 0;

    if (MEID1Set1Score > MEID2Set1Score) player1Sets++;
    else player2Sets++;

    if (MEID1Set2Score !== null && MEID2Set2Score !== null) {
      if (MEID1Set2Score > MEID2Set2Score) player1Sets++;
      else player2Sets++;
    }

    if (MEID1Set3Score !== null && MEID2Set3Score !== null) {
      if (MEID1Set3Score > MEID2Set3Score) player1Sets++;
      else player2Sets++;
    }

    match.WinnerMEID = player1Sets > player2Sets ? match.Player1MEID : match.Player2MEID;
    match.LoserMEID = player1Sets > player2Sets ? match.Player2MEID : match.Player1MEID;
    match.Status = 'graded';

    await match.save();

    const gradedMatch = await Match.findByPk(match.MAID, {
      include: [
        { model: Member, as: 'Player1', attributes: ['MEID', 'UserName', 'FirstName', 'LastName', 'MPID'] },
        { model: Member, as: 'Player2', attributes: ['MEID', 'UserName', 'FirstName', 'LastName', 'MPID'] },
        { model: Member, as: 'Winner', attributes: ['MEID', 'UserName', 'MPID'] },
        { model: Member, as: 'Loser', attributes: ['MEID', 'UserName', 'MPID'] }
      ]
    });

    res.status(200).json({
      success: true,
      match: gradedMatch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark matches as finished when time has passed
// @route   PUT /api/matches/update-status
// @access  Private (Admin)
exports.updateMatchStatuses = async (req, res) => {
  try {
    const now = new Date();

    const updatedMatches = await Match.update(
      { Status: 'finished' },
      {
        where: {
          Status: 'pending',
          DateOfMatch: { [Op.lt]: now }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `Updated ${updatedMatches[0]} matches to finished status`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get match statistics by period
// @route   GET /api/matches/stats?period=week|month|quarter
// @access  Private (Admin)
exports.getMatchStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get total matches in period (only past and today, not future)
    const total = await Match.count({
      where: {
        DateOfMatch: {
          [Op.gte]: startDate,
          [Op.lte]: now
        }
      }
    });

    // Get pending matches
    const pending = await Match.count({
      where: {
        Status: 'pending',
        DateOfMatch: {
          [Op.gte]: startDate,
          [Op.lte]: now
        }
      }
    });

    // Get finished matches awaiting grading
    const finished = await Match.count({
      where: {
        Status: 'finished',
        DateOfMatch: {
          [Op.gte]: startDate,
          [Op.lte]: now
        }
      }
    });

    // Get graded matches in period
    const graded = await Match.count({
      where: {
        Status: 'graded',
        DateOfMatch: {
          [Op.gte]: startDate,
          [Op.lte]: now
        }
      }
    });

    // Get all matches in period for daily breakdown (only past and today)
    const matchesInPeriod = await Match.findAll({
      where: {
        DateOfMatch: {
          [Op.gte]: startDate,
          [Op.lte]: now
        }
      },
      attributes: ['DateOfMatch'],
      order: [['DateOfMatch', 'ASC']]
    });

    // Calculate daily match counts
    const daysCount = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const dailyData = [];

    // Initialize all days with 0 matches in chronological order
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      dailyData.push({ date: dateStr, matches: 0 });
    }

    // Count matches per day
    matchesInPeriod.forEach(match => {
      const matchDate = new Date(match.DateOfMatch);
      const dateStr = `${matchDate.getMonth() + 1}/${matchDate.getDate()}`;
      const dayIndex = dailyData.findIndex(d => d.date === dateStr);
      if (dayIndex !== -1) {
        dailyData[dayIndex].matches++;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        finished,
        graded,
        period,
        dailyData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to calculate match summary
function calculateMatchSummary(match) {
  let summary = [0, 0];

  if (match.MEID1Set1Score > match.MEID2Set1Score) {
    summary[0]++;
  } else {
    summary[1]++;
  }

  if (match.MEID1Set2Score > match.MEID2Set2Score) {
    summary[0]++;
  } else {
    summary[1]++;
  }

  if (match.MEID1Set3Score > match.MEID2Set3Score) {
    summary[0]++;
  } else {
    summary[1]++;
  }

  return summary;
}
