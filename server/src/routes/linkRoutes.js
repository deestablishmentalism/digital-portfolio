import express from "express"
import { getAllLinks, createLink, getFooterLinks, saveFooterLinks, saveLink, getContactLinks, deleteLink } from "../controllers/linkController.js";
import {requireAuth }from "../controllers/sessionAuth.js";
const router = express.Router();

//public endpoints
router.get("/", getAllLinks);
router.get("/footer", getFooterLinks);
router.get("/contacts", getContactLinks);
//authenticated endpoints
router.get("/contacts/admin", requireAuth, getContactLinks);
router.get("/footer/admin", requireAuth, getFooterLinks);
router.get("/admin", requireAuth, getAllLinks);
router.post("/",requireAuth, createLink);
router.put("/", requireAuth, saveLink);
router.delete("/", requireAuth, deleteLink);
router.put("/footer", requireAuth,saveFooterLinks);
export default router;