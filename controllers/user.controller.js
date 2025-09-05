// controllers/studentController.js

/**
 * This file contains the controller functions related to student operations.
 * Currently, it includes a function to retrieve all students from the database.
 *
 * Add more functions here to handle other student-related operations (e.g., create, update, delete).
 */
import pool from "../config/db.js";
import { logger } from "../utils/index.js";
import bcrypt from "bcrypt";

// SIGNUP FOR INDIVIDUAL USER
export const individualSignup = async (req, res) => {
  const { first_name, last_name, email, phone, bio, skills, sectors, password } = req.body;

  // Input validation
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "First name, last name, email, and password are required" 
    });
  }

  try {
    // Check if user already exists
    const userCheck = await pool.query(
      "SELECT * FROM user_profiles WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: "User with this email already exists" 
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO user_profiles 
       (first_name, last_name, email, phone, bio, skills, sectors, password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING user_id, first_name, last_name, email`,
      [first_name, last_name, email, phone, bio, skills, sectors, hashedPassword]
    );

    res.status(201).json({ 
      success: true, 
      user: result.rows[0],
      message: "User registered successfully" 
    });
  } catch (error) {
    console.error("Database insert error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Database error", 
      error: error.message 
    });
  }
};

// GETTING FROM THE INSIGHT
export async function getInsights(req, res) {
  try {
    const result = await pool.query("SELECT * FROM insights ORDER BY date_created DESC");
    res.json(result.rows); // send back all companies
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Error fetching Jobs table" });
  }
}