import express from "express"
import { loginUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/logging-in", loginUser);
export default router;