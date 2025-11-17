const { Sequelize } = require('sequelize');
require('dotenv').config();

// PostgreSQL configuration (migrated from MySQL)
// Changed: dialect from 'mysql' to 'postgres', port from 3306 to 5432
const sequelize = new Sequelize(
  process.env.DB_NAME || 'tennisclub',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres', // Changed from 'mysql'
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      // Optional: SSL for production (Supabase requires SSL)
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    // Force IPv4 to avoid IPv6 connection issues on Render
    native: false,
    databaseVersion: '13.0'
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
