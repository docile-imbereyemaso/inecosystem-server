/**
 * This file defines the routes related to student operations.
 * It currently includes a route to get all students.
 *
 * Add more routes for creating, updating, and deleting students as needed.
 */
import express, { Router } from "express";



import { deleteStudent, getAllStudents,updateStudent,searchbyname, getStudent} from "../controllers/ineco.controller.js";


import {insertCompany,insertContribution,getContribution, insertInternship, insertJob, getCompanies, getJobs,getInternships, insertInsight,getInsights} from "../controllers/companies.controller.js";
import {individualSignup} from "../controllers/user.controller.js";

const router = express.Router();


// import { createCompany } from "../controllers/companies.controller.js";

router.post("/companies", insertCompany);
router.post("/companyData", getCompanies);
router.post("/contributions", insertContribution);
router.get("/getContribution", getContribution);
router.post("/internships", insertInternship);
router.get("/getInternships", getInternships);
router.post("/jobs", insertJob);
router.get("/jobsData", getJobs)
router.post("/insights", insertInsight);
router.get("/getInsights", getInsights);
router.post("/individualsignup", individualSignup);




export default router;

