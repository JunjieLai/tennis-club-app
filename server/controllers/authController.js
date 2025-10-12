const jwt = require('jsonwebtoken');
const { Member } = require('../models');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new member
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      FirstName,
      LastName,
      UserName,
      Email,
      MPassword,
      Phone,
      Age,
      Gender,
      UTR,
      Signature
    } = req.body;

    // Check if user already exists
    const existingUser = await Member.findOne({
      where: { Email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Check username
    const existingUsername = await Member.findOne({
      where: { UserName }
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Generate avatar URL using DiceBear API
    const MPID = `https://api.dicebear.com/7.x/avataaars/svg?seed=${UserName}`;

    // Create member
    const member = await Member.create({
      FirstName,
      LastName,
      UserName,
      Email,
      MPassword,
      Phone,
      Age,
      Gender,
      UTR: parseFloat(UTR),
      Signature,
      MPID,
      DateofCreation: new Date()
    });

    // Generate token
    const token = generateToken(member.MEID);

    res.status(201).json({
      success: true,
      token,
      member: {
        MEID: member.MEID,
        FirstName: member.FirstName,
        LastName: member.LastName,
        UserName: member.UserName,
        Email: member.Email,
        Phone: member.Phone,
        Age: member.Age,
        Gender: member.Gender,
        UTR: member.UTR,
        Signature: member.Signature,
        MPID: member.MPID,
        isAdmin: member.isAdmin
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login member
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for member
    const member = await Member.findOne({ where: { Email: email } });

    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await member.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(member.MEID);

    res.status(200).json({
      success: true,
      token,
      member: {
        MEID: member.MEID,
        FirstName: member.FirstName,
        LastName: member.LastName,
        UserName: member.UserName,
        Email: member.Email,
        Phone: member.Phone,
        Age: member.Age,
        Gender: member.Gender,
        UTR: member.UTR,
        Signature: member.Signature,
        MPID: member.MPID,
        isAdmin: member.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current logged in member
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const member = await Member.findByPk(req.user.MEID, {
      attributes: { exclude: ['MPassword'] }
    });

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

// @desc    Update member profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      UserName: req.body.UserName,
      Phone: req.body.Phone,
      Age: req.body.Age,
      Gender: req.body.Gender,
      UTR: req.body.UTR,
      Signature: req.body.Signature
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const member = await Member.findByPk(req.user.MEID);
    await member.update(fieldsToUpdate);

    res.status(200).json({
      success: true,
      member: {
        MEID: member.MEID,
        FirstName: member.FirstName,
        LastName: member.LastName,
        UserName: member.UserName,
        Email: member.Email,
        Phone: member.Phone,
        Age: member.Age,
        Gender: member.Gender,
        UTR: member.UTR,
        Signature: member.Signature,
        MPID: member.MPID
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
