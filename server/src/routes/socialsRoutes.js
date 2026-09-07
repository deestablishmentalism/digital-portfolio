import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { load } from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/", (req, res) => {
    const filePath = path.resolve(__dirname, "../data/socials.yml");
    const file = fs.readFileSync(filePath, "utf-8");
    const data = load(file);
    res.json(data);
});
export default router;