const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Member = sequelize.define('Member', {
  MEID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  FirstName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  LastName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  UserName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  Signature: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  MPassword: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  Age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Gender: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  UTR: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  DateOfCreation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  MPID: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'member',
  timestamps: true
});

// Hash password before saving
Member.beforeCreate(async (member) => {
  if (member.MPassword) {
    const salt = await bcrypt.genSalt(10);
    member.MPassword = await bcrypt.hash(member.MPassword, salt);
  }
});

Member.beforeUpdate(async (member) => {
  if (member.changed('MPassword')) {
    const salt = await bcrypt.genSalt(10);
    member.MPassword = await bcrypt.hash(member.MPassword, salt);
  }
});

// Method to compare passwords
Member.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.MPassword);
};

module.exports = Member;
