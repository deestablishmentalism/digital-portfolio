import express from "express"
import { getAllProjects, createProject, updateProject, deleteProject } from "../controllers/projectController.js";
import { requireAuth } from "../controllers/sessionAuth.js";
const router = express.Router();
//public endpoints
router.get("/", getAllProjects);
//authenticated endpoints
router.get("/admin", requireAuth, getAllProjects);
router.post("/", requireAuth,createProject);
router.put("/:id", requireAuth, updateProject);
router.delete("/:id", requireAuth, deleteProject);
export default router;
