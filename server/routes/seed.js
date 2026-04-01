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

// POST /api/seed - Initialize database with sample data for presentation
router.post('/', async (req, res) => {
  try {
    console.log('🌱 Starting database seed for presentation...');

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

    // Create regular users (28 users)
    const users = [];
    for (let i = 0; i < 28; i++) {
      const firstName = firstNames[randomInt(0, firstNames.length - 1)];
      const lastName = lastNames[randomInt(0, lastNames.length - 1)];
      const userName = (firstName.substring(0, 5) + lastName.substring(0, 5)).toLowerCase() + (i + 1);
      let utr;
      if (i < 9) utr = randomFloat(2.0, 4.9, 1);
      else if (i < 19) utr = randomFloat(5.0, 8.9, 1);
      else utr = randomFloat(9.0, 12.0, 1);

      const user = await Member.create({
        FirstName: firstName, LastName: lastName, UserName: userName,
        Signature: `${firstName} ${lastName} - Tennis enthusiast`,
        Email: `${userName}@email.com`, MPassword: 'password123',
        Phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
        Age: randomInt(18, 65), Gender: Math.random() > 0.5 ? 'Male' : 'Female',
        UTR: utr, MPID: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
        isAdmin: false
      });
      users.push(user);
    }

    // Create test players for presentation
    const testPlayer1 = await Member.create({
      FirstName: 'TestPlayer', LastName: 'One', UserName: 'testplayer1',
      Signature: 'Demo Account - Presentation Player',
      Email: 'testplayer1@email.com', MPassword: 'password123',
      Phone: '+1-555-9001', Age: 28, Gender: 'Male', UTR: 7.5,
      MPID: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testplayer1',
      isAdmin: false
    });

    const testPlayer2 = await Member.create({
      FirstName: 'TestPlayer', LastName: 'Two', UserName: 'testplayer2',
      Signature: 'Demo Account - Presentation Player',
      Email: 'testplayer2@email.com', MPassword: 'password123',
      Phone: '+1-555-9002', Age: 30, Gender: 'Female', UTR: 7.8,
      MPID: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testplayer2',
      isAdmin: false
    });

    users.push(testPlayer1, testPlayer2);

    // Get mid-tier opponents for test players
    const midTierPlayers = users.filter(u =>
      u.MEID !== testPlayer1.MEID &&
      u.MEID !== testPlayer2.MEID &&
      getUTRCategory(u.UTR) === 'mid'
    );

    // Track challenges to avoid duplicates
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

    // ================== TESTPLAYER1 DATA ==================
    console.log('Creating TestPlayer1 presentation data...');

    // TestPlayer1: Graded matches in last 7 days (3 matches, 2 wins 1 loss)
    for (let i = 0; i < 3; i++) {
      const opponent = midTierPlayers[i % midTierPlayers.length];
      const matchDate = randomDate(new Date(now.getTime() - 7 * 86400000), new Date(now.getTime() - 1 * 86400000));
      const challenge = await createUniqueChallenge(testPlayer1, opponent, 'Accept', matchDate, 'Recent match!');

      if (challenge) {
        const score = generateTennisScore();
        // Force 2 wins, 1 loss
        const winner = i < 2 ? testPlayer1.MEID : opponent.MEID;
        const loser = i < 2 ? opponent.MEID : testPlayer1.MEID;

        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDate, Status: 'graded',
          Player1MEID: testPlayer1.MEID, Player2MEID: opponent.MEID,
          MEID1Set1Score: score.set1p1, MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1, MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1, MEID2Set3Score: score.set3p2,
          WinnerMEID: winner, LoserMEID: loser
        });
        matchCount++;
      }
    }

    // TestPlayer1: Graded matches from 8-30 days ago (5 matches total for 8 in 30 days)
    for (let i = 0; i < 5; i++) {
      const opponent = midTierPlayers[(i + 3) % midTierPlayers.length];
      const matchDate = randomDate(new Date(now.getTime() - 30 * 86400000), new Date(now.getTime() - 8 * 86400000));
      const challenge = await createUniqueChallenge(testPlayer1, opponent, 'Accept', matchDate, 'Monthly match!');

      if (challenge) {
        const score = generateTennisScore();
        // Mixed results: 3 wins, 2 losses
        const winner = i < 3 ? testPlayer1.MEID : opponent.MEID;
        const loser = i < 3 ? opponent.MEID : testPlayer1.MEID;

        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDate, Status: 'graded',
          Player1MEID: testPlayer1.MEID, Player2MEID: opponent.MEID,
          MEID1Set1Score: score.set1p1, MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1, MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1, MEID2Set3Score: score.set3p2,
          WinnerMEID: winner, LoserMEID: loser
        });
        matchCount++;
      }
    }

    // TestPlayer1: Graded matches from 31-90 days ago (12 matches for 20 total in quarter)
    for (let i = 0; i < 12; i++) {
      const opponent = midTierPlayers[(i + 8) % midTierPlayers.length];
      const matchDate = randomDate(new Date(now.getTime() - 90 * 86400000), new Date(now.getTime() - 31 * 86400000));
      const challenge = await createUniqueChallenge(testPlayer1, opponent, 'Accept', matchDate, 'Quarterly match!');

      if (challenge) {
        const score = generateTennisScore();
        // Balanced: 6 wins, 6 losses
        const winner = i < 6 ? testPlayer1.MEID : opponent.MEID;
        const loser = i < 6 ? opponent.MEID : testPlayer1.MEID;

        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDate, Status: 'graded',
          Player1MEID: testPlayer1.MEID, Player2MEID: opponent.MEID,
          MEID1Set1Score: score.set1p1, MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1, MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1, MEID2Set3Score: score.set3p2,
          WinnerMEID: winner, LoserMEID: loser
        });
        matchCount++;
      }
    }

    // TestPlayer1: November matches (4 graded matches)
    for (let i = 0; i < 4; i++) {
      const opponent = midTierPlayers[(i + 20) % midTierPlayers.length];
      const nov2025 = new Date('2025-11-01');
      const matchDate = randomDate(nov2025, new Date('2025-11-30'));
      const challenge = await createUniqueChallenge(testPlayer1, opponent, 'Accept', matchDate, 'November match!');

      if (challenge) {
        const score = generateTennisScore();
        const winner = score.winner === 1 ? testPlayer1.MEID : opponent.MEID;
        const loser = score.winner === 1 ? opponent.MEID : testPlayer1.MEID;

        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDate, Status: 'graded',
          Player1MEID: testPlayer1.MEID, Player2MEID: opponent.MEID,
          MEID1Set1Score: score.set1p1, MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1, MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1, MEID2Set3Score: score.set3p2,
          WinnerMEID: winner, LoserMEID: loser
        });
        matchCount++;
      }
    }

    // TestPlayer1: December future matches (4 pending matches)
    for (let i = 0; i < 4; i++) {
      const opponent = midTierPlayers[(i + 24) % midTierPlayers.length];
      const dec2025 = new Date('2025-12-01');
      const matchDateTime = randomDate(dec2025, new Date('2025-12-31'));
      const challenge = await createUniqueChallenge(testPlayer1, opponent, 'Accept', matchDateTime, 'December match scheduled!');

      if (challenge) {
        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDateTime, Status: 'pending',
          Player1MEID: testPlayer1.MEID, Player2MEID: opponent.MEID,
          MEID1Set1Score: null, MEID2Set1Score: null, WinnerMEID: null, LoserMEID: null
        });
        matchCount++;
      }
    }

    // TestPlayer1: Received challenges waiting (6 challenges)
    for (let i = 0; i < 6; i++) {
      const challenger = midTierPlayers[i % midTierPlayers.length];
      const matchDateTime = randomDate(new Date(now.getTime() + 3 * 86400000), new Date(now.getTime() + 20 * 86400000));
      await createUniqueChallenge(challenger, testPlayer1, 'Wait', matchDateTime, 'Challenge from opponent!');
    }

    // TestPlayer1: Sent challenges (10 challenges)
    for (let i = 0; i < 10; i++) {
      const challenged = midTierPlayers[(i + 6) % midTierPlayers.length];
      const matchDateTime = randomDate(new Date(now.getTime() + 2 * 86400000), new Date(now.getTime() + 15 * 86400000));
      await createUniqueChallenge(testPlayer1, challenged, 'Wait', matchDateTime, 'Looking forward to our match!');
    }

    // ================== TESTPLAYER2 DATA ==================
    console.log('Creating TestPlayer2 presentation data...');

    // TestPlayer2: Graded matches in last 7 days (3 matches, 2 wins 1 loss)
    for (let i = 0; i < 3; i++) {
      const opponent = midTierPlayers[(i + 16) % midTierPlayers.length];
      const matchDate = randomDate(new Date(now.getTime() - 7 * 86400000), new Date(now.getTime() - 1 * 86400000));
      const challenge = await createUniqueChallenge(testPlayer2, opponent, 'Accept', matchDate, 'Recent match!');

      if (challenge) {
        const score = generateTennisScore();
        const winner = i < 2 ? testPlayer2.MEID : opponent.MEID;
        const loser = i < 2 ? opponent.MEID : testPlayer2.MEID;

        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDate, Status: 'graded',
          Player1MEID: testPlayer2.MEID, Player2MEID: opponent.MEID,
          MEID1Set1Score: score.set1p1, MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1, MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1, MEID2Set3Score: score.set3p2,
          WinnerMEID: winner, LoserMEID: loser
        });
        matchCount++;
      }
    }

    // TestPlayer2: Graded matches from 8-30 days ago (5 matches)
    for (let i = 0; i < 5; i++) {
      const opponent = midTierPlayers[(i + 19) % midTierPlayers.length];
      const matchDate = randomDate(new Date(now.getTime() - 30 * 86400000), new Date(now.getTime() - 8 * 86400000));
      const challenge = await createUniqueChallenge(testPlayer2, opponent, 'Accept', matchDate, 'Monthly match!');

      if (challenge) {
        const score = generateTennisScore();
        const winner = i < 4 ? testPlayer2.MEID : opponent.MEID;
        const loser = i < 4 ? opponent.MEID : testPlayer2.MEID;

        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDate, Status: 'graded',
          Player1MEID: testPlayer2.MEID, Player2MEID: opponent.MEID,
          MEID1Set1Score: score.set1p1, MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1, MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1, MEID2Set3Score: score.set3p2,
          WinnerMEID: winner, LoserMEID: loser
        });
        matchCount++;
      }
    }

    // TestPlayer2: Graded matches from 31-90 days ago (12 matches)
    for (let i = 0; i < 12; i++) {
      const opponent = midTierPlayers[(i + 24) % midTierPlayers.length];
      const matchDate = randomDate(new Date(now.getTime() - 90 * 86400000), new Date(now.getTime() - 31 * 86400000));
      const challenge = await createUniqueChallenge(testPlayer2, opponent, 'Accept', matchDate, 'Quarterly match!');

      if (challenge) {
        const score = generateTennisScore();
        const winner = i < 7 ? testPlayer2.MEID : opponent.MEID;
        const loser = i < 7 ? opponent.MEID : testPlayer2.MEID;

        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDate, Status: 'graded',
          Player1MEID: testPlayer2.MEID, Player2MEID: opponent.MEID,
          MEID1Set1Score: score.set1p1, MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1, MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1, MEID2Set3Score: score.set3p2,
          WinnerMEID: winner, LoserMEID: loser
        });
        matchCount++;
      }
    }

    // TestPlayer2: November matches (5 graded matches)
    for (let i = 0; i < 5; i++) {
      const opponent = midTierPlayers[(i + 36) % midTierPlayers.length];
      const nov2025 = new Date('2025-11-01');
      const matchDate = randomDate(nov2025, new Date('2025-11-30'));
      const challenge = await createUniqueChallenge(testPlayer2, opponent, 'Accept', matchDate, 'November match!');

      if (challenge) {
        const score = generateTennisScore();
        const winner = score.winner === 1 ? testPlayer2.MEID : opponent.MEID;
        const loser = score.winner === 1 ? opponent.MEID : testPlayer2.MEID;

        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDate, Status: 'graded',
          Player1MEID: testPlayer2.MEID, Player2MEID: opponent.MEID,
          MEID1Set1Score: score.set1p1, MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1, MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1, MEID2Set3Score: score.set3p2,
          WinnerMEID: winner, LoserMEID: loser
        });
        matchCount++;
      }
    }

    // TestPlayer2: December future matches (4 pending matches)
    for (let i = 0; i < 4; i++) {
      const opponent = midTierPlayers[(i + 41) % midTierPlayers.length];
      const dec2025 = new Date('2025-12-01');
      const matchDateTime = randomDate(dec2025, new Date('2025-12-31'));
      const challenge = await createUniqueChallenge(testPlayer2, opponent, 'Accept', matchDateTime, 'December match scheduled!');

      if (challenge) {
        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDateTime, Status: 'pending',
          Player1MEID: testPlayer2.MEID, Player2MEID: opponent.MEID,
          MEID1Set1Score: null, MEID2Set1Score: null, WinnerMEID: null, LoserMEID: null
        });
        matchCount++;
      }
    }

    // TestPlayer2: Received challenges waiting (5 challenges)
    for (let i = 0; i < 5; i++) {
      const challenger = midTierPlayers[(i + 16) % midTierPlayers.length];
      const matchDateTime = randomDate(new Date(now.getTime() + 3 * 86400000), new Date(now.getTime() + 20 * 86400000));
      await createUniqueChallenge(challenger, testPlayer2, 'Wait', matchDateTime, 'Challenge from opponent!');
    }

    // TestPlayer2: Sent challenges (10 challenges)
    for (let i = 0; i < 10; i++) {
      const challenged = midTierPlayers[(i + 21) % midTierPlayers.length];
      const matchDateTime = randomDate(new Date(now.getTime() + 2 * 86400000), new Date(now.getTime() + 15 * 86400000));
      await createUniqueChallenge(testPlayer2, challenged, 'Wait', matchDateTime, 'Looking forward to our match!');
    }

    // ================== BACKGROUND DATA FOR OTHER USERS ==================
    console.log('Creating background data for other users...');

    // Random matches between other users (50 graded matches)
    for (let i = 0; i < 50; i++) {
      const player1 = users[randomInt(0, users.length - 3)]; // Exclude test players
      const player2 = getOpponent(player1, users.filter(u => u.MEID !== testPlayer1.MEID && u.MEID !== testPlayer2.MEID));
      if (!player2) continue;

      const matchDate = randomDate(new Date(now.getTime() - 90 * 86400000), new Date(now.getTime() - 6 * 86400000));
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

    // Finished matches for admin grading (12 matches)
    for (let i = 0; i < 12; i++) {
      const player1 = users[randomInt(0, users.length - 3)];
      const player2 = getOpponent(player1, users.filter(u => u.MEID !== testPlayer1.MEID && u.MEID !== testPlayer2.MEID));
      if (!player2) continue;

      const matchDate = randomDate(new Date(now.getTime() - 5 * 86400000), new Date(now.getTime() - 1 * 86400000));
      const challenge = await createUniqueChallenge(player1, player2, 'Accept', matchDate, 'Match finished, awaiting grading');

      if (challenge) {
        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDate, Status: 'finished',
          Player1MEID: player1.MEID, Player2MEID: player2.MEID,
          MEID1Set1Score: null, MEID2Set1Score: null,
          MEID1Set2Score: null, MEID2Set2Score: null,
          MEID1Set3Score: null, MEID2Set3Score: null,
          WinnerMEID: null, LoserMEID: null
        });
        matchCount++;
      }
    }

    // Random pending matches for other users (20 matches)
    for (let i = 0; i < 20; i++) {
      const player1 = users[randomInt(0, users.length - 3)];
      const player2 = getOpponent(player1, users.filter(u => u.MEID !== testPlayer1.MEID && u.MEID !== testPlayer2.MEID));
      if (!player2) continue;

      const matchDateTime = randomDate(new Date(now.getTime() + 1 * 86400000), new Date(now.getTime() + 30 * 86400000));
      const challenge = await createUniqueChallenge(player1, player2, 'Accept', matchDateTime, 'Upcoming match!');

      if (challenge) {
        await Match.create({
          CID: challenge.CID, DateOfMatch: matchDateTime, Status: 'pending',
          Player1MEID: player1.MEID, Player2MEID: player2.MEID,
          MEID1Set1Score: null, MEID2Set1Score: null, WinnerMEID: null, LoserMEID: null
        });
        matchCount++;
      }
    }

    // Random waiting challenges between other users (15 challenges)
    for (let i = 0; i < 15; i++) {
      const challenger = users[randomInt(0, users.length - 3)];
      let challenged = users[randomInt(0, users.length - 3)];
      while (challenged.MEID === challenger.MEID) {
        challenged = users[randomInt(0, users.length - 3)];
      }
      const matchDateTime = randomDate(new Date(now.getTime() + 1 * 86400000), new Date(now.getTime() + 14 * 86400000));
      await createUniqueChallenge(challenger, challenged, 'Wait', matchDateTime, 'Looking forward to playing!');
    }

    console.log('✅ Presentation data seed complete!');

    res.json({
      success: true,
      message: 'Database seeded successfully with presentation data!',
      data: {
        users: users.length + 1, // +1 for admin
        challenges: challengeCount,
        matches: matchCount,
        testPlayer1Data: {
          email: 'testplayer1@email.com',
          password: 'password123',
          last7DaysMatches: 3,
          last30DaysMatches: 8,
          last90DaysMatches: 20,
          novemberMatches: 4,
          decemberMatches: 4,
          receivedChallenges: 6,
          sentChallenges: 10
        },
        testPlayer2Data: {
          email: 'testplayer2@email.com',
          password: 'password123',
          last7DaysMatches: 3,
          last30DaysMatches: 8,
          last90DaysMatches: 20,
          novemberMatches: 5,
          decemberMatches: 4,
          receivedChallenges: 5,
          sentChallenges: 10
        },
        adminData: {
          email: 'admin@tennisclub.com',
          password: 'admin123',
          finishedMatchesToGrade: 12
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
