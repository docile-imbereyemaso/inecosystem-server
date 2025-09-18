import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import  sequelize  from '../config/database.js';
import Company from '../models/Company.js';
// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  });
};



export const individualSignup = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { 
      firstName, 
      secondName, 
      email, 
      phoneNumber, 
      bio, 
      skills = [], 
      sectors = [], 
      password, 
      status 
    } = req.body;

    // Required fields
    if (!firstName || !secondName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, second name, email, and password are required"
      });
    }

    // Email format validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // File uploads (if present)
    let profileImageUrl = null;
    let resumeUrl = null;
    let officialDocumentUrl = null;

    if (req.files) {
      // Profile image
      if (req.files.profileImage) {
        const uploadResult = await uploadToCloudinary(
          req.files.profileImage[0].buffer,
          `profile_${Date.now()}`,
          req.files.profileImage[0].mimetype
        );
        profileImageUrl = uploadResult.secure_url;
      }

      // Resume
      if (req.files.resume) {
        const uploadResult = await uploadToCloudinary(
          req.files.resume[0].buffer,
          `resume_${Date.now()}.pdf`,
          req.files.resume[0].mimetype
        );
        resumeUrl = uploadResult.secure_url;
      }

      // Official document
      if (req.files.officialDocument) {
        const uploadResult = await uploadToCloudinary(
          req.files.officialDocument[0].buffer,
          `document_${Date.now()}.pdf`,
          req.files.officialDocument[0].mimetype
        );
        officialDocumentUrl = uploadResult.secure_url;
      }
    }

    // Create user
    const user = await User.create({
      first_name: firstName,
      last_name: secondName,
      email,
      phone: phoneNumber,
      bio,
      status,
      skills: Array.isArray(skills) ? skills : [],
      sectors: Array.isArray(sectors) ? sectors : [],
      password,
      user_type: 'individual',
      is_approved: true,
      profile_image: profileImageUrl,
      resume: resumeUrl,
      official_document: officialDocumentUrl
    }, { transaction: t });

    await t.commit();

    // Generate token
    const token = generateToken(user.user_id);

    // Clean response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      user: userResponse,
      token,
      message: "User registered successfully"
    });

  } catch (error) {
    await t.rollback();
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
      email,
      contactNumber,
      password,
      companyName,
      companyRegId,
      companySize,
      focus,
      location,
      offerings,
      companyRepresentative
    } = req.body;

    const [firstName, lastName] = (companyRepresentative || '').split(' ');

    // Basic validation
    if (!firstName || !email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, password, and company name are required",
        data: { firstName, lastName, email, contactNumber, password }
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

  
    // Upload files
    let profileImageUrl = null;
    let legalDocumentUrl = null;

    if (req.files?.profileImage) {
      const file = req.files.profileImage[0];
      const uploadResult = await uploadToCloudinary(
        file.buffer,
        `private_sector/profile_images_${Date.now()}`,
        file.mimetype
      );
      profileImageUrl = uploadResult.secure_url;
    }

    if (req.files?.legalDocument) {
      const file = req.files.legalDocument[0];
      const uploadResult = await uploadToCloudinary(
        file.buffer,
        `private_sector/legal_documents_${Date.now()}.pdf`,
        file.mimetype
      );
      legalDocumentUrl = uploadResult.secure_url;
    }

    // Parse offerings
    let offeringsData = [];
    if (offerings) {
      if (typeof offerings === "string") {
        try {
          offeringsData = JSON.parse(offerings);
        } catch {
          offeringsData = [offerings];
        }
      } else if (Array.isArray(offerings)) {
        offeringsData = offerings;
      }
    }

   

    const user = await User.create({
      first_name: firstName,
      last_name: lastName || '-',
      email,
      phone: contactNumber,
      password, 
      user_type: 'private_sector',
      is_approved: false,
      sectors: offeringsData,
      profile_image: profileImageUrl,
      official_document:legalDocumentUrl ,
      company_name: companyName,
      company_size: companySize,
      industry:focus
    });

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