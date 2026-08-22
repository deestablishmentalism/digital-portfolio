import express from "express"
import { getAllProjects, createProject } from "../controllers/projectController.js";
import { requireAuth } from "../controllers/sessionAuth.js";
const router = express.Router();
//public endpoints
router.get("/", getAllProjects);
//authenticated endpoints
router.get("/admin", requireAuth, getAllProjects);
router.post("/", requireAuth,createProject);
export default router;
