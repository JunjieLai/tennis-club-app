const { Member, Match, Challenge } = require('../models');
const { Op, fn, col } = require('sequelize');

// @desc    Get all members
// @route   GET /api/members
// @access  Private
exports.getAllMembers = async (req, res) => {
  try {
    const { search, gender, minAge, maxAge, minUTR, maxUTR, page = 1, limit = 20, excludeAdmins = 'false' } = req.query;

    let whereClause = {};

    // Exclude admins from results (for user searches/rankings)
    if (excludeAdmins === 'true') {
      whereClause.isAdmin = false;
    }

    // Search by username
    if (search) {
      whereClause.UserName = { [Op.like]: `%${search}%` };
    }

    // Filter by gender
    if (gender) {
      whereClause.Gender = gender;
    }

    // Filter by age range
    if (minAge || maxAge) {
      whereClause.Age = {};
      if (minAge) whereClause.Age[Op.gte] = parseInt(minAge);
      if (maxAge) whereClause.Age[Op.lte] = parseInt(maxAge);
    }

    // Filter by UTR range
    if (minUTR || maxUTR) {
      whereClause.UTR = {};
      if (minUTR) whereClause.UTR[Op.gte] = parseFloat(minUTR);
      if (maxUTR) whereClause.UTR[Op.lte] = parseFloat(maxUTR);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: members } = await Member.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['MPassword'] },
      order: [['UTR', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      attributes: { exclude: ['MPassword'] }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.status(200).json({
      success: true,
      member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get member statistics
// @route   GET /api/members/:id/stats
// @access  Private
exports.getMemberStats = async (req, res) => {
  try {
    const memberId = req.params.id;

    // Get wins and losses
    const wins = await Match.count({
      where: { WinnerMEID: memberId }
    });

    const losses = await Match.count({
      where: { LoserMEID: memberId }
    });

    // Get match history
    const matches = await Match.findAll({
      where: {
        [Op.or]: [
          { WinnerMEID: memberId },
          { LoserMEID: memberId }
        ]
      },
      include: [
        { model: Member, as: 'Winner', attributes: ['MEID', 'UserName', 'MPID'] },
        { model: Member, as: 'Loser', attributes: ['MEID', 'UserName', 'MPID'] }
      ],
      order: [['DateOfMatch', 'ASC']]
    });

    // Calculate win rate over time
    const history = [];
    let totalWins = 0;
    matches.forEach((match, index) => {
      if (match.WinnerMEID === parseInt(memberId)) {
        totalWins++;
      }
      history.push({
        date: match.DateOfMatch,
        winRate: totalWins / (index + 1)
      });
    });

    res.status(200).json({
      success: true,
      stats: {
        wins,
        losses,
        totalMatches: wins + losses,
        winRate: wins + losses > 0 ? (wins / (wins + losses) * 100).toFixed(2) : 0,
        history
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

// @desc    Get best challengers for a member
// @route   GET /api/members/:id/challengers
// @access  Private
exports.getBestChallengers = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Find members with similar UTR (+/- 1)
    const challengers = await Member.findAll({
      where: {
        UTR: {
          [Op.between]: [member.UTR - 1, member.UTR + 1]
        },
        MEID: {
          [Op.ne]: member.MEID
        }
      },
      attributes: { exclude: ['MPassword'] },
      order: [['UTR', 'ASC']],
      limit: 8
    });

    res.status(200).json({
      success: true,
      count: challengers.length,
      challengers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get top players by UTR
// @route   GET /api/members/top/:limit
// @access  Private
exports.getTopPlayers = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;

    const topPlayers = await Member.findAll({
      where: { isAdmin: false },  // Exclude admins from rankings
      attributes: { exclude: ['MPassword'] },
      order: [['UTR', 'DESC']],
      limit
    });

    res.status(200).json({
      success: true,
      count: topPlayers.length,
      topPlayers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get most active players (by matches in last month)
// @route   GET /api/members/active/:limit
// @access  Private
exports.getMostActivePlayers = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 5;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Get all matches from the last month
    const recentMatches = await Match.findAll({
      where: {
        DateOfMatch: { [Op.gte]: oneMonthAgo },
        Status: 'graded'
      }
    });

    // Count matches per member
    const memberMatchCounts = {};
    recentMatches.forEach(match => {
      memberMatchCounts[match.Player1MEID] = (memberMatchCounts[match.Player1MEID] || 0) + 1;
      memberMatchCounts[match.Player2MEID] = (memberMatchCounts[match.Player2MEID] || 0) + 1;
    });

    // Sort by match count and get top members
    const sortedMembers = Object.entries(memberMatchCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // Fetch member details
    const activePlayers = await Promise.all(
      sortedMembers.map(async ([meid, matchCount]) => {
        const member = await Member.findByPk(meid, {
          where: { isAdmin: false },
          attributes: { exclude: ['MPassword'] }
        });
        return member ? { ...member.toJSON(), matchCount } : null;
      })
    );

    res.status(200).json({
      success: true,
      count: activePlayers.filter(p => p).length,
      activePlayers: activePlayers.filter(p => p)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get member analytics (for charts)
// @route   GET /api/members/analytics/stats
// @access  Private (Admin)
exports.getMemberAnalytics = async (req, res) => {
  try {
    // Include ALL members (including admins) in statistics
    const baseWhere = {};

    // Total member count
    const totalMembers = await Member.count({ where: baseWhere });
    const adminCount = await Member.count({ where: { isAdmin: true } });
    const regularCount = await Member.count({ where: { isAdmin: false } });

    // Gender distribution
    const maleCount = await Member.count({ where: { ...baseWhere, Gender: 'Male' } });
    const femaleCount = await Member.count({ where: { ...baseWhere, Gender: 'Female' } });

    // UTR level distribution
    const lowLevel = await Member.count({
      where: { ...baseWhere, UTR: { [Op.between]: [0, 4.9] } }
    });
    const midLevel = await Member.count({
      where: { ...baseWhere, UTR: { [Op.between]: [5, 8.9] } }
    });
    const highLevel = await Member.count({
      where: { ...baseWhere, UTR: { [Op.gte]: 9 } }
    });

    // Age distribution
    const child = await Member.count({
      where: { ...baseWhere, Age: { [Op.between]: [0, 12] } }
    });
    const teen = await Member.count({
      where: { ...baseWhere, Age: { [Op.between]: [13, 18] } }
    });
    const adult = await Member.count({
      where: { ...baseWhere, Age: { [Op.between]: [19, 50] } }
    });
    const elder = await Member.count({
      where: { ...baseWhere, Age: { [Op.gte]: 51 } }
    });

    // Calculate average UTR
    const avgUTRResult = await Member.findOne({
      attributes: [[fn('AVG', col('UTR')), 'avgUTR']]
    });
    const avgUTR = avgUTRResult ? parseFloat(avgUTRResult.dataValues.avgUTR).toFixed(2) : 0;

    // Calculate average Age (rounded down)
    const avgAgeResult = await Member.findOne({
      attributes: [[fn('AVG', col('Age')), 'avgAge']]
    });
    const avgAge = avgAgeResult ? Math.floor(parseFloat(avgAgeResult.dataValues.avgAge)) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalMembers,
        gender: { male: maleCount, female: femaleCount },
        utrLevel: { low: lowLevel, mid: midLevel, high: highLevel },
        age: { child, teen, adult, elder },
        avgUTR,
        avgAge
      }
    });
  } catch (error) {
    console.error('Member analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private (Admin)
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Prevent deleting admin users
    if (member.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete associated matches first, then challenges (due to foreign key constraint)
    await Match.destroy({ where: {
      [Op.or]: [
        { Player1MEID: req.params.id },
        { Player2MEID: req.params.id }
      ]
    }});

    await Challenge.destroy({ where: {
      [Op.or]: [
        { ChallengerMEID: req.params.id },
        { ChallengedMEID: req.params.id }
      ]
    }});

    await member.destroy();

    res.status(200).json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update member profile
// @route   PUT /api/members/:id
// @access  Private
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Only allow user to update their own profile (unless admin)
    if (req.user.MEID !== parseInt(req.params.id) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Update allowed fields
    const { FirstName, LastName, Email, Phone, Age, Gender } = req.body;

    if (FirstName) member.FirstName = FirstName;
    if (LastName) member.LastName = LastName;
    if (Email) member.Email = Email;
    if (Phone !== undefined) member.Phone = Phone;
    if (Age) member.Age = Age;
    if (Gender) member.Gender = Gender;

    await member.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      member
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
