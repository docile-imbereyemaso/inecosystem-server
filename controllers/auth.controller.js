import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  });
};

// SIGNUP FOR INDIVIDUAL USER
export const individualSignup = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, bio, skills, sectors, password } = req.body;

    // Input validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "First name, last name, email, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }

    // Create new user
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      bio,
      skills,
      sectors,
      password,
      user_type: 'individual',
      is_approved: true // Individual users are automatically approved
    });

    // Generate token
    const token = generateToken(user.user_id);

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(201).json({ 
      success: true, 
      user: userResponse,
      token,
      message: "User registered successfully" 
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during registration", 
      error: error.message 
    });
  }
};

// SIGNUP FOR PRIVATE SECTOR USER
export const privateSectorSignup = async (req, res) => {
  try {
    const { 
      first_name, last_name, email, phone, bio, 
      company_name, company_size, industry, password 
    } = req.body;

    // Input validation
    if (!first_name || !last_name || !email || !password || !company_name) {
      return res.status(400).json({ 
        success: false, 
        message: "First name, last name, email, company name, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }

    // Create new user
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      bio,
      company_name,
      company_size,
      industry,
      password,
      user_type: 'private_sector',
      is_approved: false // Needs TVET approval
    });

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(201).json({ 
      success: true, 
      user: userResponse,
      message: "Private sector account created. Waiting for TVET approval." 
    });
  } catch (error) {
    console.error("Private sector signup error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during registration", 
      error: error.message 
    });
  }
};

// LOGIN USER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Check if private sector user is approved
    if (user.user_type === 'private_sector' && !user.is_approved) {
      return res.status(403).json({ 
        success: false, 
        message: "Your account is pending approval from TVET administration" 
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // Generate token
    const token = generateToken(user.user_id);

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(200).json({ 
      success: true, 
      user: userResponse,
      token,
      message: "Login successful" 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during login", 
      error: error.message 
    });
  }
};

// GET CURRENT USER PROFILE
export const getProfile = async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      user: req.user 
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching profile" 
    });
  }
};