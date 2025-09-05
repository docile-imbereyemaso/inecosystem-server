/**
 * This file contains the controller functions related to student operations.
 * Currently, it includes a function to retrieve all students from the database.
 *
 * Add more functions here to handle other student-related operations (e.g., create, update, delete).
 */
import pool from "../config/db.js";
import { logger } from "../utils/index.js";



export const insertCompany = async (req, res) => {
  const { name, description, locations, contacts, offerings } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO companies (name, description, locations, contacts, offerings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name,
        description,
        JSON.stringify(locations),
        JSON.stringify(contacts),
        JSON.stringify(offerings)
      ]
    );

    res.status(201).json({ success: true, company: result.rows[0] });
  } catch (error) {
    console.error("Database insert error:", error);
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
};
// CONTRIBUTION INSERT
export async function insertContribution(req, res) {
  const { title, type, description, author, dateCreated, status, tags, fileUrl } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO contributions 
        (title, type, description, author, date_created, status, tags, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
       RETURNING *`,
      [
        title,
        type,
        description || null,
        author,
        dateCreated || new Date().toISOString(),
        status,
        JSON.stringify(tags || []),
        fileUrl || null
      ]
    );

    res.status(201).json({ success: true, contribution: result.rows[0] });
  } catch (error) {
    console.error("Database insert error:", error); // ✅ this logs the real issue
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
}
// INSERTING THE INTERNSHIP TABLE



export async function insertInternship(req, res){
  try {
    const {
      name, type, level, sponsorship,
      sector, period, applicationOpen, deadline
    } = req.body;

    const result = await pool.query(
      `INSERT INTO internships (name, type, level, sponsorship, sector, period, application_open, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
  [
    name,
    type,
    level,
    sponsorship,
    sector,
    period,
    applicationOpen,
    deadline,
  ]

    );

    res.status(201).json({ success: true, company: result.rows[0] });
  } catch (error) {
    console.error("Database insert error:", error);
    res.status(500).json({ success: false, message: "Database error", error: error.message });
  }
};

// INSERT INTO JOBS



export const insertJob = async (req, res) => {
  try {
    const {
      name,
      type,
      skillsRequired,
      qualifications,
      level,
      link,
      period,
      positions,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO jobs (name, type, skillsRequired, qualifications, level, link, period, positions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, type, JSON.stringify(skillsRequired),JSON.stringify(qualifications),  level, link, period, positions]
    );

    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    console.error("Insert job error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};


// INSERT IN INSIGHT
export const insertInsight = async (req, res) => {
  try {
    const { title, sector, skillsGapSuggestion, priority, tags } = req.body;

    // Convert tags array to simple string for now
    const tagsString = Array.isArray(tags) ? tags.join(', ') : '';

    const result = await pool.query(
      `INSERT INTO insights (title, sector, skills_gap_suggestion, priority, tags)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, sector, skillsGapSuggestion, priority || 'Medium', tagsString]
    );

    res.json({ success: true, insight: result.rows[0] });
    
  } catch (err) {
    console.error("INSERT ERROR DETAILS:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack
    });
    
    // Make sure to send detailed error info
    res.status(500).json({ 
      success: false, 
      message: "Database operation failed",
      error: err.message,
      code: err.code,
      detail: err.detail
    });
  }
};
// GETTING DATAS FROM THE DATABASE

// COMPANY GETTING
export async function getCompanies(req, res) {
  try {
    const result = await pool.query("SELECT * FROM companies ORDER BY created_at DESC");
    res.json(result.rows); // send back all companies
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Error fetching companies" });
  }
}

// GETTING FROM JOBS TABLE
export async function getJobs(req, res) {
  try {
    const result = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
    res.json(result.rows); // send back all companies
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Error fetching Jobs table" });
  }
}

//GETTING FROM THE INTERNSHIP 
export async function getInternships(req, res) {
  try {
    const result = await pool.query("SELECT * FROM internships ORDER BY created_at DESC");
    res.json(result.rows); // send back all companies
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Error fetching Jobs table" });
  }
}
//GETTING FROM THE CONTRIBUTIONS
export async function getContribution(req, res) {
  try {
    const result = await pool.query("SELECT * FROM contributions ORDER BY created_at DESC");
    res.json(result.rows); // send back all companies
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Error fetching Jobs table" });
  }
}
//GETTING FROM THE INSIGHT
export async function getInsights(req, res) {
  try {
    const result = await pool.query("SELECT * FROM insights ORDER BY date_created DESC");
    res.json(result.rows); // send back all companies
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Error fetching Jobs table" });
  }
}