import express from "express"
import { loginUser, logoutUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/logging-in", loginUser);
router.post("/logging-out", logoutUser);
export default router;