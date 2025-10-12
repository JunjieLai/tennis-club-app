const { sequelize } = require('../config/database');
const { Member, Challenge, Match } = require('../models');

// Sample data arrays
const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Emma', 'Robert', 'Olivia',
                    'William', 'Ava', 'Richard', 'Sophia', 'Thomas', 'Isabella', 'Charles', 'Mia', 'Daniel', 'Charlotte'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                   'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];

// Generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random float between min and max
function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

// Get UTR category
function getUTRCategory(utr) {
  if (utr < 5) return 'low';
  if (utr >= 9) return 'high';
  return 'mid';
}

// Get a random opponent from the same UTR category
function getOpponent(player, users) {
  const playerCategory = getUTRCategory(player.UTR);
  const sameCategory = users.filter(u =>
    u.MEID !== player.MEID &&
    getUTRCategory(u.UTR) === playerCategory
  );

  if (sameCategory.length === 0) return null;
  return sameCategory[randomInt(0, sameCategory.length - 1)];
}

// Generate realistic tennis score (always 3 sets)
function generateTennisScore() {
  const sets = [];
  let p1Sets = 0, p2Sets = 0;

  // Generate 3 sets
  for (let i = 0; i < 3; i++) {
    let p1Score, p2Score;

    // Realistic tennis set scores
    const scenarios = [
      [6, 0], [6, 1], [6, 2], [6, 3], [6, 4],
      [7, 5], [7, 6], [0, 6], [1, 6], [2, 6],
      [3, 6], [4, 6], [5, 7], [6, 7]
    ];

    const scenario = scenarios[randomInt(0, scenarios.length - 1)];
    p1Score = scenario[0];
    p2Score = scenario[1];

    sets.push({ p1: p1Score, p2: p2Score });

    if (p1Score > p2Score) p1Sets++;
    else p2Sets++;
  }

  // Determine winner
  const winner = p1Sets > p2Sets ? 1 : 2;

  return {
    set1p1: sets[0].p1,
    set1p2: sets[0].p2,
    set2p1: sets[1].p1,
    set2p2: sets[1].p2,
    set3p1: sets[2].p1,
    set3p2: sets[2].p2,
    winner
  };
}

async function generateSampleData() {
  try {
    console.log('🗑️  Clearing existing data...');

    // Clear existing data in correct order (respecting foreign keys)
    await Match.destroy({ where: {}, truncate: false });
    await Challenge.destroy({ where: {}, truncate: false });
    await Member.destroy({ where: {}, truncate: false });

    console.log('👤 Creating admin account...');

    // Create admin account (password will be hashed by beforeCreate hook)
    const admin = await Member.create({
      FirstName: 'Admin',
      LastName: 'User',
      UserName: 'admin',
      Signature: 'Tennis Club Administrator',
      Email: 'admin@tennisclub.com',
      MPassword: 'admin123',
      Phone: '+1-555-0000',
      Age: 35,
      Gender: 'Male',
      UTR: 10.0,
      MPID: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      isAdmin: true
    });

    console.log('✅ Admin created:', {
      email: 'admin@tennisclub.com',
      password: 'admin123',
      username: 'admin'
    });

    console.log('👥 Creating regular users...');

    // Create 30 regular users with balanced UTR distribution
    const users = [];
    for (let i = 0; i < 30; i++) {
      const firstName = firstNames[randomInt(0, firstNames.length - 1)];
      const lastName = lastNames[randomInt(0, lastNames.length - 1)];
      const userName = (firstName.substring(0, 5) + lastName.substring(0, 5)).toLowerCase() + (i + 1);
      const gender = Math.random() > 0.5 ? 'Male' : 'Female';
      const age = randomInt(15, 65);

      // Balanced UTR distribution: 10 users in each category
      let utr;
      if (i < 10) {
        utr = randomFloat(2.0, 4.9, 1);  // Low: 0-4.9
      } else if (i < 20) {
        utr = randomFloat(5.0, 8.9, 1);  // Mid: 5-8.9
      } else {
        utr = randomFloat(9.0, 12.0, 1); // High: 9+
      }

      // Password will be hashed by beforeCreate hook
      const user = await Member.create({
        FirstName: firstName,
        LastName: lastName,
        UserName: userName,
        Signature: `${firstName} ${lastName} - Tennis enthusiast`,
        Email: `${userName}@email.com`,
        MPassword: 'password123',
        Phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
        Age: age,
        Gender: gender,
        UTR: utr,
        MPID: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
        isAdmin: false
      });

      users.push(user);

      if ((i + 1) % 10 === 0) {
        console.log(`   Created ${i + 1}/30 users...`);
      }
    }

    console.log('✅ Created 30 users (all with password: password123)');

    // Create two special test players with specific data
    console.log('👥 Creating 2 special test players...');

    const testPlayer1 = await Member.create({
      FirstName: 'TestPlayer',
      LastName: 'One',
      UserName: 'testplayer1',
      Signature: 'Test Player for Dashboard & Calendar Testing',
      Email: 'testplayer1@email.com',
      MPassword: 'password123',
      Phone: '+1-555-9001',
      Age: 28,
      Gender: 'Male',
      UTR: 7.5,
      MPID: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testplayer1',
      isAdmin: false
    });

    const testPlayer2 = await Member.create({
      FirstName: 'TestPlayer',
      LastName: 'Two',
      UserName: 'testplayer2',
      Signature: 'Test Player for Dashboard & Calendar Testing',
      Email: 'testplayer2@email.com',
      MPassword: 'password123',
      Phone: '+1-555-9002',
      Age: 30,
      Gender: 'Female',
      UTR: 7.8,
      MPID: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testplayer2',
      isAdmin: false
    });

    users.push(testPlayer1, testPlayer2);

    console.log('✅ Created 2 test players (testplayer1@email.com, testplayer2@email.com)');

    console.log('🤝 Creating challenges...');

    const challenges = [];
    const now = new Date();

    // Track challenges by player pair and date to prevent duplicates
    const challengeTracker = new Set();

    const createUniqueChallenge = async (challenger, challenged, state, matchDateTime, notes) => {
      // Create date key (just the date, not time)
      const dateKey = new Date(matchDateTime).toDateString();

      // Create player pair key (sorted to ensure both directions are tracked)
      const playerPairKey = [challenger.MEID, challenged.MEID].sort().join('-');

      // Create unique challenge key
      const challengeKey = `${playerPairKey}-${dateKey}`;

      // Check if this challenge already exists
      if (challengeTracker.has(challengeKey)) {
        return null; // Skip duplicate
      }

      // Mark this combination as used
      challengeTracker.add(challengeKey);

      // Create the challenge
      return await Challenge.create({
        ChallengerMEID: challenger.MEID,
        ChallengedMEID: challenged.MEID,
        State: state,
        DateOfChallenge: randomDate(new Date(now.getTime() - 7 * 86400000), now),
        MatchDateTime: matchDateTime,
        Notes: notes
      });
    };

    // Wait status challenges (15)
    for (let i = 0; i < 15; i++) {
      const challenger = users[randomInt(0, users.length - 1)];
      let challenged = users[randomInt(0, users.length - 1)];
      while (challenged.MEID === challenger.MEID) {
        challenged = users[randomInt(0, users.length - 1)];
      }

      const matchDateTime = randomDate(new Date(now.getTime() + 86400000), new Date(now.getTime() + 14 * 86400000)); // 1-14 days from now

      const challenge = await createUniqueChallenge(challenger, challenged, 'Wait', matchDateTime, 'Looking forward to a great match!');

      if (challenge) {
        challenges.push(challenge);
      }
    }

    // Create challenges between test players
    for (let i = 0; i < 3; i++) {
      const challenger = i % 2 === 0 ? testPlayer1 : testPlayer2;
      const challenged = i % 2 === 0 ? testPlayer2 : testPlayer1;

      const matchDateTime = randomDate(new Date(now.getTime() + 2 * 86400000), new Date(now.getTime() + 10 * 86400000));

      await createUniqueChallenge(challenger, challenged, 'Wait', matchDateTime, 'Test challenge between test players');
    }

    // Accept status challenges for pending matches (30) - same UTR level
    for (let i = 0; i < 30; i++) {
      const challenger = users[randomInt(0, users.length - 1)];
      const challenged = getOpponent(challenger, users);

      if (!challenged) continue; // Skip if no opponent in same category

      const matchDateTime = randomDate(new Date(now.getTime() + 86400000), new Date(now.getTime() + 30 * 86400000)); // 1-30 days from now

      const challenge = await createUniqueChallenge(challenger, challenged, 'Accept', matchDateTime, 'Challenge accepted!');

      if (challenge) {
        // Create pending match
        await Match.create({
          CID: challenge.CID,
          DateOfMatch: matchDateTime,
          Status: 'pending',
          Player1MEID: challenger.MEID,
          Player2MEID: challenged.MEID,
          MEID1Set1Score: null,
          MEID2Set1Score: null,
          WinnerMEID: null,
          LoserMEID: null
        });

        challenges.push(challenge);
      }
    }

    // Add upcoming matches for test players (spread over next 60 days)
    for (let i = 0; i < 10; i++) {
      const challenger = i % 2 === 0 ? testPlayer1 : testPlayer2;
      const challenged = i % 2 === 0 ? testPlayer2 : testPlayer1;

      const matchDateTime = randomDate(new Date(now.getTime() + 5 * 86400000), new Date(now.getTime() + 60 * 86400000));

      const challenge = await createUniqueChallenge(challenger, challenged, 'Accept', matchDateTime, 'Test match for calendar');

      if (challenge) {
        await Match.create({
          CID: challenge.CID,
          DateOfMatch: matchDateTime,
          Status: 'pending',
          Player1MEID: challenger.MEID,
          Player2MEID: challenged.MEID,
          MEID1Set1Score: null,
          MEID2Set1Score: null,
          WinnerMEID: null,
          LoserMEID: null
        });
      }
    }

    // Reject status challenges (8)
    for (let i = 0; i < 8; i++) {
      const challenger = users[randomInt(0, users.length - 1)];
      let challenged = users[randomInt(0, users.length - 1)];
      while (challenged.MEID === challenger.MEID) {
        challenged = users[randomInt(0, users.length - 1)];
      }

      const matchDateTime = randomDate(now, new Date(now.getTime() + 7 * 86400000));

      const challenge = await createUniqueChallenge(challenger, challenged, 'Reject', matchDateTime, 'Sorry, not available');

      if (challenge) {
        challenges.push(challenge);
      }
    }

    console.log('✅ Created challenges (15 Wait, 30 Accept, 8 Reject)');

    console.log('🏁 Creating finished matches (awaiting grading)...');

    let finishedCount = 0;

    // Create 15 finished matches awaiting grading - same UTR level
    for (let i = 0; i < 15; i++) {
      const challenger = users[randomInt(0, users.length - 1)];
      const challenged = getOpponent(challenger, users);

      if (!challenged) continue;

      const matchDate = randomDate(new Date(now.getTime() - 5 * 86400000), new Date(now.getTime() - 86400000)); // 1-5 days ago

      const challenge = await createUniqueChallenge(challenger, challenged, 'Accept', matchDate, 'Match completed, awaiting score entry');

      if (challenge) {
        await Match.create({
          CID: challenge.CID,
          DateOfMatch: matchDate,
          Status: 'finished',
          Player1MEID: challenger.MEID,
          Player2MEID: challenged.MEID,
          MEID1Set1Score: null,
          MEID2Set1Score: null,
          WinnerMEID: null,
          LoserMEID: null
        });

        finishedCount++;
      }
    }

    console.log(`✅ Created ${finishedCount} finished matches (awaiting grading)`);

    console.log('📊 Creating graded matches (historical data)...');

    let gradedCount = 0;

    // Create 120 graded matches for better statistics (all with 3 sets)
    for (let i = 0; i < 120; i++) {
      const player1 = users[randomInt(0, users.length - 1)];
      const player2 = getOpponent(player1, users);

      // Skip if no same-category opponent available
      if (!player2) continue;

      const matchDate = randomDate(new Date(now.getTime() - 180 * 86400000), new Date(now.getTime() - 6 * 86400000)); // 6-180 days ago

      const challenge = await createUniqueChallenge(player1, player2, 'Accept', matchDate, 'Great match!');

      if (challenge) {
        // Generate realistic 3-set match
        const score = generateTennisScore();

        const winner = score.winner === 1 ? player1.MEID : player2.MEID;
        const loser = score.winner === 1 ? player2.MEID : player1.MEID;

        await Match.create({
          CID: challenge.CID,
          DateOfMatch: matchDate,
          Status: 'graded',
          Player1MEID: player1.MEID,
          Player2MEID: player2.MEID,
          MEID1Set1Score: score.set1p1,
          MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1,
          MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1,
          MEID2Set3Score: score.set3p2,
          WinnerMEID: winner,
          LoserMEID: loser
        });

        gradedCount++;

        if ((gradedCount) % 20 === 0) {
          console.log(`   Created ${gradedCount}/120 graded matches...`);
        }
      }
    }

    // Create many graded matches for test players (60 matches over past 6 months)
    console.log('📊 Creating graded matches for test players...');

    for (let i = 0; i < 60; i++) {
      const player1 = i % 2 === 0 ? testPlayer1 : testPlayer2;
      const player2 = i % 2 === 0 ? testPlayer2 : testPlayer1;

      const matchDate = randomDate(new Date(now.getTime() - 180 * 86400000), new Date(now.getTime() - 7 * 86400000));

      const challenge = await createUniqueChallenge(player1, player2, 'Accept', matchDate, 'Test player match');

      if (challenge) {
        // Generate realistic 3-set match
        const score = generateTennisScore();

        const winner = score.winner === 1 ? player1.MEID : player2.MEID;
        const loser = score.winner === 1 ? player2.MEID : player1.MEID;

        await Match.create({
          CID: challenge.CID,
          DateOfMatch: matchDate,
          Status: 'graded',
          Player1MEID: player1.MEID,
          Player2MEID: player2.MEID,
          MEID1Set1Score: score.set1p1,
          MEID2Set1Score: score.set1p2,
          MEID1Set2Score: score.set2p1,
          MEID2Set2Score: score.set2p2,
          MEID1Set3Score: score.set3p1,
          MEID2Set3Score: score.set3p2,
          WinnerMEID: winner,
          LoserMEID: loser
        });

        gradedCount++;
      }
    }

    console.log(`✅ Created ${gradedCount} total graded matches (all with 3 sets)`);

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  ✨ Sample Data Generation Complete!                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const totalChallenges = await Challenge.count();
    const totalMatches = await Match.count();
    const pendingMatches = await Match.count({ where: { Status: 'pending' } });
    const finishedMatches = await Match.count({ where: { Status: 'finished' } });
    const gradedMatches = await Match.count({ where: { Status: 'graded' } });

    console.log('📊 Summary:');
    console.log(`   👤 Users: 32 total (1 admin + 30 regular + 2 test players)`);
    console.log(`   🤝 Challenges: ${totalChallenges}`);
    console.log(`   🎾 Matches: ${totalMatches} total`);
    console.log(`      - Pending: ${pendingMatches}`);
    console.log(`      - Finished (awaiting grading): ${finishedMatches}`);
    console.log(`      - Graded (all with 3 sets): ${gradedMatches}`);

    console.log('\n🔐 Login Credentials:');
    console.log('   Admin:');
    console.log('     Email: admin@tennisclub.com');
    console.log('     Password: admin123');
    console.log('\n   Test Players (for dashboard/calendar testing):');
    console.log('     Email: testplayer1@email.com');
    console.log('     Email: testplayer2@email.com');
    console.log('     Password: password123');
    console.log('\n   Regular Users:');
    console.log('     Password for all users: password123');
    console.log('     Example user emails: Use any username from database + @email.com');

    console.log('\n✅ You can now start the application and log in!');

  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the script
generateSampleData()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Failed:', err);
    process.exit(1);
  });
