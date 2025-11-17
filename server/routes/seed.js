const express = require('express');
const router = express.Router();
const { Member, Challenge, Match } = require('../models');

// Sample data arrays
const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Emma', 'Robert', 'Olivia',
                    'William', 'Ava', 'Richard', 'Sophia', 'Thomas', 'Isabella', 'Charles', 'Mia', 'Daniel', 'Charlotte'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                   'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getUTRCategory(utr) {
  if (utr < 5) return 'low';
  if (utr >= 9) return 'high';
  return 'mid';
}

function getOpponent(player, users) {
  const playerCategory = getUTRCategory(player.UTR);
  const sameCategory = users.filter(u =>
    u.MEID !== player.MEID &&
    getUTRCategory(u.UTR) === playerCategory
  );
  if (sameCategory.length === 0) return null;
  return sameCategory[randomInt(0, sameCategory.length - 1)];
}

function generateTennisScore() {
  const sets = [];
  let p1Sets = 0, p2Sets = 0;
  for (let i = 0; i < 3; i++) {
    const scenarios = [
      [6, 0], [6, 1], [6, 2], [6, 3], [6, 4],
      [7, 5], [7, 6], [0, 6], [1, 6], [2, 6],
      [3, 6], [4, 6], [5, 7], [6, 7]
    ];
    const scenario = scenarios[randomInt(0, scenarios.length - 1)];
    sets.push({ p1: scenario[0], p2: scenario[1] });
    if (scenario[0] > scenario[1]) p1Sets++;
    else p2Sets++;
  }
  const winner = p1Sets > p2Sets ? 1 : 2;
  return {
    set1p1: sets[0].p1, set1p2: sets[0].p2,
    set2p1: sets[1].p1, set2p2: sets[1].p2,
    set3p1: sets[2].p1, set3p2: sets[2].p2,
    winner
  };
}

// POST /api/seed - Initialize database with sample data
router.post('/', async (req, res) => {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await Match.destroy({ where: {}, truncate: false });
    await Challenge.destroy({ where: {}, truncate: false });
    await Member.destroy({ where: {}, truncate: false });

    // Create admin
    const admin = await Member.create({
      FirstName: 'Admin', LastName: 'User', UserName: 'admin',
      Signature: 'Tennis Club Administrator',
      Email: 'admin@tennisclub.com', MPassword: 'admin123',
      Phone: '+1-555-0000', Age: 35, Gender: 'Male', UTR: 10.0,
      MPID: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      isAdmin: true
    });

    // Create regular users
    const users = [];
    for (let i = 0; i < 30; i++) {
      const firstName = firstNames[randomInt(0, firstNames.length - 1)];
      const lastName = lastNames[randomInt(0, lastNames.length - 1)];
      const userName = (firstName.substring(0, 5) + lastName.substring(0, 5)).toLowerCase() + (i + 1);
      let utr;
      if (i < 10) utr = randomFloat(2.0, 4.9, 1);
      else if (i < 20) utr = randomFloat(5.0, 8.9, 1);
      else utr = randomFloat(9.0, 12.0, 1);

      const user = await Member.create({
        FirstName: firstName, LastName: lastName, UserName: userName,
        Signature: `${firstName} ${lastName} - Tennis enthusiast`,
        Email: `${userName}@email.com`, MPassword: 'password123',
        Phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
        Age: randomInt(15, 65), Gender: Math.random() > 0.5 ? 'Male' : 'Female',
        UTR: utr, MPID: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
        isAdmin: false
      });
      users.push(user);
    }

    // Create test players
    const testPlayer1 = await Member.create({
      FirstName: 'TestPlayer', LastName: 'One', UserName: 'testplayer1',
      Signature: 'Test Player for Dashboard & Calendar Testing',
      Email: 'testplayer1@email.com', MPassword: 'password123',
      Phone: '+1-555-9001', Age: 28, Gender: 'Male', UTR: 7.5,
      MPID: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testplayer1',
      isAdmin: false
    });

    const testPlayer2 = await Member.create({
      FirstName: 'TestPlayer', LastName: 'Two', UserName: 'testplayer2',
      Signature: 'Test Player for Dashboard & Calendar Testing',
      Email: 'testplayer2@email.com', MPassword: 'password123',
      Phone: '+1-555-9002', Age: 30, Gender: 'Female', UTR: 7.8,
      MPID: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testplayer2',
      isAdmin: false
    });

    users.push(testPlayer1, testPlayer2);

    // Create challenges and matches
    const challengeTracker = new Set();
    const now = new Date();
    let challengeCount = 0;
    let matchCount = 0;

    const createUniqueChallenge = async (challenger, challenged, state, matchDateTime, notes) => {
      const dateKey = new Date(matchDateTime).toDateString();
      const playerPairKey = [challenger.MEID, challenged.MEID].sort().join('-');
      const challengeKey = `${playerPairKey}-${dateKey}`;
      if (challengeTracker.has(challengeKey)) return null;
      challengeTracker.add(challengeKey);

      const challenge = await Challenge.create({
        ChallengerMEID: challenger.MEID, ChallengedMEID: challenged.MEID,
        State: state, DateOfChallenge: randomDate(new Date(now.getTime() - 7 * 86400000), now),
        MatchDateTime: matchDateTime, Notes: notes
      });
      challengeCount++;
      return challenge;
    };

    // Wait challenges (15)
    for (let i = 0; i < 15; i++) {
      const challenger = users[randomInt(0, users.length - 1)];
      let challenged = users[randomInt(0, users.length - 1)];
      while (challenged.MEID === challenger.MEID) {
        challenged = users[randomInt(0, users.length - 1)];
      }
      const matchDateTime = randomDate(new Date(now.getTime() + 86400000), new Date(now.getTime() + 14 * 86400000));
      await createUniqueChallenge(challenger, challenged, 'Wait', matchDateTime, 'Looking forward to a great match!');
    }

    // Accept challenges with pending matches (30)
    for (let i = 0; i < 30; i++) {
      const challenger = users[randomInt(0, users.length - 1)];
      const challenged = getOpponent(challenger, users);
      if (!challenged) continue;

      const matchDateTime = randomDate(new Date(now.getTime() + 86400000), new Date(now.getTime() + 30 * 86400000));
      const challenge = await createUniqueChallenge(challenger, challenged, 'Accept', matchDateTime, 'Challenge accepted!');

      if (challenge) {
        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDateTime, Status: 'pending',
          Player1MEID: challenger.MEID, Player2MEID: challenged.MEID,
          MEID1Set1Score: null, MEID2Set1Score: null, WinnerMEID: null, LoserMEID: null
        });
        matchCount++;
      }
    }

    // Graded matches (120)
    for (let i = 0; i < 120; i++) {
      const player1 = users[randomInt(0, users.length - 1)];
      const player2 = getOpponent(player1, users);
      if (!player2) continue;

      const matchDate = randomDate(new Date(now.getTime() - 180 * 86400000), new Date(now.getTime() - 6 * 86400000));
      const challenge = await createUniqueChallenge(player1, player2, 'Accept', matchDate, 'Great match!');

      if (challenge) {
        const score = generateTennisScore();
        const winner = score.winner === 1 ? player1.MEID : player2.MEID;
        const loser = score.winner === 1 ? player2.MEID : player1.MEID;

        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDate, Status: 'graded',
          Player1MEID: player1.MEID, Player2MEID: player2.MEID,
          MEID1Set1Score: score.set1p1, MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1, MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1, MEID2Set3Score: score.set3p2,
          WinnerMEID: winner, LoserMEID: loser
        });
        matchCount++;
      }
    }

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: users.length + 1, // +1 for admin
        challenges: challengeCount,
        matches: matchCount,
        credentials: {
          admin: { email: 'admin@tennisclub.com', password: 'admin123' },
          testUser: { email: 'testplayer1@email.com', password: 'password123' }
        }
      }
    });

  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
