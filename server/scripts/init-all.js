const { exec } = require('child_process');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

async function initializeAll() {
  try {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  🚀 Tennis Club Database - Complete Initialization            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Step 1: Setup database (create database and tables)
    console.log('📦 Step 1/2: Setting up database and tables...\n');
    const setupScript = path.join(__dirname, 'setup-database.js');
    await execPromise(`node "${setupScript}"`, {
      cwd: path.join(__dirname, '../..'),
      env: process.env
    });

    console.log('\n');

    // Step 2: Generate sample data
    console.log('📦 Step 2/2: Generating sample data...\n');
    const seedScript = path.join(__dirname, 'generate-sample-data.js');
    await execPromise(`node "${seedScript}"`, {
      cwd: path.join(__dirname, '../..'),
      env: process.env
    });

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  ✨ Complete Initialization Finished!                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('🎉 All done! Your Tennis Club database is ready to use.\n');
    console.log('📝 Quick Start:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Login with:');
    console.log('      - Admin: admin@tennisclub.com / admin123');
    console.log('      - Test User: testplayer1@email.com / password123\n');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

// Run the complete initialization
initializeAll()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
  });
