/**
 * This file handles the database connection using PostgreSQL.
 * It sets up a connection pool and logs the connection status.
 *
 * Ensure your database credentials are set in the .env file.
 */

import pkg from "pg";
import dotenv from "dotenv";
import { logger } from "../utils/index.js";
import { v4 as uuidv4 } from 'uuid';

const newId = uuidv4();
const { Pool } = pkg;
dotenv.config();

// Create pool with SSL
const pool = new Pool({
  user: String(process.env.DB_USER),
  host: String(process.env.DB_HOST),
  database: String(process.env.DB_NAME),
  password: String(process.env.DB_PASSWORD),  // ✅ force string
  port: Number(process.env.DB_PORT),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => console.log("INFO:: Connected to PostgreSQL Database"))
  .catch(err => console.error("ERROR:: Database setup error:", err));


// Setup database and create table if it doesn't exist
(async function () {
  const client = await pool.connect();
  try {
    logger.info("Connected to PostgreSQL Database");

    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text NOT NULL,
        description text,
        locations jsonb,
        contacts jsonb,
        offerings jsonb,
        created_at timestamp with time zone DEFAULT now()
      );


    


    `);

  await client.query(`
 
    CREATE TABLE IF NOT EXISTS insights (
    id VARCHAR(50) PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    skills_gap_suggestion TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
    date_created DATE NOT NULL DEFAULT CURRENT_DATE,
    tags TEXT[] DEFAULT '{}'
);


    `);


    // INTERNSHIPS TABLE

    await client.query(
      `CREATE TABLE IF NOT EXISTS internships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Summer', 'Winter', 'Part-time', 'Full-time')),
  level text NOT NULL CHECK (level IN ('High School', 'Undergraduate', 'Graduate', 'PhD')),
  sponsorship boolean NOT NULL DEFAULT false,
  sector text NOT NULL CHECK (sector IN ('Technology', 'Finance', 'Healthcare', 'Marketing', 'Engineering', 'Design', 'Research')),
  period text NOT NULL,
  application_open boolean NOT NULL DEFAULT true,
  deadline timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);`
    );
   
    // JOBS TABLE

    await client.query(`CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Full-time', 'Part-time', 'Contract', 'Freelance')),
  skillsRequired jsonb NOT NULL DEFAULT '[]',
  qualifications jsonb NOT NULL DEFAULT '[]',
  level text NOT NULL CHECK (level IN ('Entry', 'Mid', 'Senior', 'Lead')),
  link text NOT NULL,
  period text NOT NULL,
  positions integer NOT NULL CHECK (positions >= 1),
  created_at timestamp with time zone DEFAULT now()
);`);

// CONTRIBUTION TABLE

await client.query(`CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('Research Report', 'Industry Analysis', 'Skills Assessment', 'Market Study', 'Other')),
  description text,
  author text NOT NULL,
  date_created timestamp with time zone NOT NULL,
  status text NOT NULL CHECK (status IN ('Draft', 'Under Review', 'Published', 'Archived')),
  tags jsonb NOT NULL DEFAULT '[]',
  file_url text,
  created_at timestamp with time zone DEFAULT now()
);`);

// -------------



// TVET TABLES CREATED WITH THE FOLLOWING QUERRIES

// TVET PROFILE

await client.query(`CREATE TABLE IF NOT EXISTS tvet_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);`);

// STATISTICS REPORT

await client.query(`CREATE TABLE IF NOT EXISTS statistics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type TEXT NOT NULL CHECK (report_type IN ('overview','skills','companies','training','opportunities')),
  period TEXT NOT NULL CHECK (period IN ('1month','3months','6months','1year')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  file_url TEXT
);`);

// PRIVATE SECTOR PARTNERSHIP TABLE
await client.query(`CREATE TABLE IF NOT EXISTS companies_partnership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  registration_date DATE,
  status TEXT NOT NULL CHECK (status IN ('registered','pending')),
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);`);

// OPPORTUNITIES TABLE

await client.query(`CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  sector TEXT,
  level TEXT,
  location TEXT,
  salary TEXT,
  positions INT,
  description TEXT,
  requirements JSONB NOT NULL DEFAULT '[]',
  period JSONB NOT NULL,  -- {startDate, endDate, duration}
  status TEXT CHECK (status IN ('Active','Closed','Pending')) DEFAULT 'Active',
  applicants INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);`);

// SKILLS FEEDBACK TABLE

await client.query(`CREATE TABLE IF NOT EXISTS skills_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_name TEXT NOT NULL,
  category TEXT,
  current_level INT CHECK (current_level BETWEEN 1 AND 5),
  desired_level INT CHECK (desired_level BETWEEN 1 AND 5),
  priority TEXT CHECK (priority IN ('low','medium','high')),
  feedback TEXT,
  training_needed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);`);

// ON TVET TABLES THEY ARE CREATED NOW

// CERTIFICATE TABLE
await client.query(`CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL, -- Assuming user authentication
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  skills TEXT[], -- Array of skills
  credential_id VARCHAR(100) UNIQUE NOT NULL,
  verification_url TEXT,
  description TEXT
);`);

// REWARDS TABLE


await client.query(`CREATE TABLE IF NOT EXISTS rewards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  awarded_by VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(100)
);`);

// INTERNSHIP AND TRAINING PROGRAMS TABLE

await client.query(`CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  stipend VARCHAR(50),
  location VARCHAR(100) NOT NULL,
  deadline DATE NOT NULL,
  description TEXT,
  requirements TEXT[], -- Array of requirements
  status VARCHAR(50) NOT NULL
);`);

// APPLICATION TABLE 

await client.query(`CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  program_id INTEGER REFERENCES programs(id),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  applied_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  next_step TEXT
);`);

// COMPLETE PROGRAMS

await client.query(`CREATE TABLE IF NOT EXISTS completed_programs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  completed_date DATE NOT NULL,
  grade VARCHAR(10),
  certificate VARCHAR(100)
);`);


// USER PROFILE TABLE

await client.query(`CREATE TABLE IF NOT EXISTS user_profiles (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  skills TEXT[], -- Array of skills
  sectors TEXT[], -- Array of interested sectors
  password VARCHAR(255) NOT NULL -- Added password column
);`);


    await client.query(`INSERT INTO companies (name, description, locations, contacts, offerings)
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
    logger.info("Database setup complete");
  } catch (err) {
    logger.error(`Database setup error: ${err.message}`);
  } finally {
    client.release();
  }
})();

export default pool;


console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_USER:", process.env.DB_NAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);