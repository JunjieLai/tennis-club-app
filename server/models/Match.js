const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Match = sequelize.define('Match', {
  MAID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  CID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  DateOfMatch: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Status: {
    type: DataTypes.ENUM('pending', 'finished', 'graded'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'pending: not started, finished: awaiting grading, graded: completed'
  },
  MEID1Set1Score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  MEID2Set1Score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  MEID1Set2Score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  MEID2Set2Score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  MEID1Set3Score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  MEID2Set3Score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  WinnerMEID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  LoserMEID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  Player1MEID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'First player in the match'
  },
  Player2MEID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Second player in the match'
  }
}, {
  tableName: 'tmatch',
  timestamps: false
});

module.exports = Match;
