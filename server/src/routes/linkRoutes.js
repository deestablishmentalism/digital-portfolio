import express from "express"
import { getAllLinks, createLink, getFooterLinks, saveFooterLinks, saveLink, getContactLinks } from "../controllers/linkController.js";
const router = express.Router();

router.get("/",  getAllLinks);
router.post("/", createLink);
router.put("/", saveLink);
router.put("/footer", saveFooterLinks);
router.get("/footer", getFooterLinks);
router.get("/contacts", getContactLinks);
export default router;