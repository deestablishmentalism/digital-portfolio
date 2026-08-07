import express from "express"
import { getAllProjects, createProject } from "../controllers/projectController.js";
const router = express.Router();

router.get("/", getAllProjects);
router.post("/", createProject);
export default router;
