import express from "express"
import { getSkills, saveSkills } from "../controllers/skillController.js";

const router = express.Router();

router.get("/", getSkills);
router.put("/", saveSkills);

export default router;
