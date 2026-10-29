import express from "express"
import { getAllWorkExperiences, createWorkExperience, updateWorkExperience, deleteWorkExperience } from "../controllers/workExperienceController.js";
import { requireAuth } from "../controllers/sessionAuth.js";
const router = express.Router();

//public endpoints
router.get("/", getAllWorkExperiences);
//authenticated endpoints
router.get("/admin", requireAuth, getAllWorkExperiences);
router.post("/", requireAuth, createWorkExperience);
router.put("/:id", requireAuth, updateWorkExperience);
router.delete("/:id", requireAuth, deleteWorkExperience);

export default router;

