
import express, { Router } from "express";



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

