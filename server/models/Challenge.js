const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Challenge = sequelize.define('Challenge', {
  CID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  State: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'Wait'
  },
  ChallengerMEID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ChallengedMEID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  DateOfChallenge: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  MatchDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Scheduled match time when challenge is created'
  },
  Notes: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'challenge',
  timestamps: false
});

module.exports = Challenge;
