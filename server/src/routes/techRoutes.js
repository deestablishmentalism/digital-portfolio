import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {load} from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/", (req, res) => {
    const filePath = path.resolve(__dirname, "../data/tech.yml");
    const file = fs.readFileSync(filePath, "utf8");
    const techData = load(file);
    const cleanedData = Object.fromEntries(
        Object.entries(techData).map(([category, items]) => [
            category,
            Object.entries(items).map(([name, data]) => ({
                name,
                ...data,
            })),
        ])
    );
    res.json(cleanedData);
});

export default router;