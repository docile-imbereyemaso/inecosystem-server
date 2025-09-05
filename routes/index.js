/**
 * This file defines the main routing for the application.
 * It imports student routes and applies middleware for logging requests.
 *
 * To add more routes, import them here and use `router.use()` to define new paths.
 */
import express from "express";

import studentRoutes from "./ineco.routes.js";
import { requestLogger } from "../middlewares/index.js";

const router = express.Router();

router.use("/students", requestLogger, studentRoutes);

export default router;
