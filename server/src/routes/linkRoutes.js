import express from "express"
import { getAllLinks, createLink, getFooterLinks, saveFooterLinks } from "../controllers/linkController.js";
const router = express.Router();

router.get("/",  getAllLinks);
router.post("/", createLink);
router.put("/footer", saveFooterLinks);
router.get("/footer", getFooterLinks);
export default router;