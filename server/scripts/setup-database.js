const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  let connection;

  try {
    console.log('🔧 Starting database setup...\n');

    // Connect to MySQL server (without specifying database)
    console.log('📡 Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Connected to MySQL server\n');

    const dbName = process.env.DB_NAME || 'tennisclub';

    // Drop database if exists (for clean setup)
    console.log(`🗑️  Dropping database '${dbName}' if exists...`);
    await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log('✅ Old database dropped (if existed)\n');

    // Create database
    console.log(`🏗️  Creating database '${dbName}'...`);
    await connection.query(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database created successfully\n');

    // Use the new database
    await connection.query(`USE ${dbName}`);

    // Create Member table
    console.log('📋 Creating Member table...');
    await connection.query(`
      CREATE TABLE member (
        MEID INT NOT NULL AUTO_INCREMENT,
        UserName VARCHAR(10) NOT NULL,
        Signature VARCHAR(50) DEFAULT NULL,
        FirstName VARCHAR(50) NOT NULL,
        LastName VARCHAR(50) DEFAULT NULL,
        Email VARCHAR(50) NOT NULL UNIQUE,
        MPassword VARCHAR(255) NOT NULL,
        Phone VARCHAR(20) NOT NULL,
        Age INT NOT NULL,
        Gender VARCHAR(10) NOT NULL,
        UTR FLOAT NOT NULL,
        DateOfCreation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        MPID VARCHAR(255) DEFAULT NULL,
        isAdmin BOOLEAN DEFAULT FALSE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (MEID),
        INDEX idx_email (Email),
        INDEX idx_username (UserName)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Member table created\n');

    // Create Challenge table
    console.log('📋 Creating Challenge table...');
    await connection.query(`
      CREATE TABLE challenge (
        CID INT NOT NULL AUTO_INCREMENT,
        State VARCHAR(10) NOT NULL,
        ChallengerMEID INT NOT NULL,
        ChallengedMEID INT NOT NULL,
        DateOfChallenge DATE NOT NULL,
        MatchDateTime DATETIME NOT NULL,
        Notes VARCHAR(255) DEFAULT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (CID),
        INDEX idx_challenger (ChallengerMEID),
        INDEX idx_challenged (ChallengedMEID),
        INDEX idx_state (State),
        INDEX idx_match_datetime (MatchDateTime),
        FOREIGN KEY (ChallengerMEID) REFERENCES member(MEID) ON DELETE CASCADE,
        FOREIGN KEY (ChallengedMEID) REFERENCES member(MEID) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Challenge table created\n');

    // Create Match table (tmatch)
    console.log('📋 Creating Match table...');
    await connection.query(`
      CREATE TABLE tmatch (
        MAID INT NOT NULL AUTO_INCREMENT,
        CID INT NOT NULL,
        DateOfMatch DATETIME NOT NULL,
        Status ENUM('pending', 'finished', 'graded') NOT NULL DEFAULT 'pending',
        Player1MEID INT NOT NULL,
        Player2MEID INT NOT NULL,
        MEID1Set1Score INT DEFAULT NULL,
        MEID2Set1Score INT DEFAULT NULL,
        MEID1Set2Score INT DEFAULT NULL,
        MEID2Set2Score INT DEFAULT NULL,
        MEID1Set3Score INT DEFAULT NULL,
        MEID2Set3Score INT DEFAULT NULL,
        WinnerMEID INT DEFAULT NULL,
        LoserMEID INT DEFAULT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (MAID),
        INDEX idx_cid (CID),
        INDEX idx_status (Status),
        INDEX idx_date_of_match (DateOfMatch),
        INDEX idx_player1 (Player1MEID),
        INDEX idx_player2 (Player2MEID),
        INDEX idx_winner (WinnerMEID),
        INDEX idx_loser (LoserMEID),
        FOREIGN KEY (CID) REFERENCES challenge(CID) ON DELETE CASCADE,
        FOREIGN KEY (Player1MEID) REFERENCES member(MEID) ON DELETE CASCADE,
        FOREIGN KEY (Player2MEID) REFERENCES member(MEID) ON DELETE CASCADE,
        FOREIGN KEY (WinnerMEID) REFERENCES member(MEID) ON DELETE SET NULL,
        FOREIGN KEY (LoserMEID) REFERENCES member(MEID) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Match table created\n');

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  ✨ Database Setup Complete!                                   ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Database: ${dbName}`);
    console.log('📋 Tables created:');
    console.log('   ✓ member (with indexes on Email, UserName)');
    console.log('   ✓ challenge (with foreign keys and indexes)');
    console.log('   ✓ tmatch (with foreign keys and indexes)');
    console.log('\n✅ Database is ready for data population!');
    console.log('💡 Next step: Run "npm run seed" to populate with sample data\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
setupDatabase()
  .then(() => {
    console.log('✅ Setup completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Setup failed:', err);
    process.exit(1);
  });
