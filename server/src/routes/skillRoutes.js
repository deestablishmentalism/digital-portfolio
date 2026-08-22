import express from "express"
import { getSkills, saveSkills } from "../controllers/skillController.js";
import { requireAuth } from "../controllers/sessionAuth.js";
const router = express.Router();

router.get("/", getSkills);
router.get("/admin", requireAuth, getSkills);
router.put("/", requireAuth, saveSkills);

export default router;
