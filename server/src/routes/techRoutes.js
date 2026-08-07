import express from "express";
import fs from "fs";
import {load} from "js-yaml";

const router = express.Router();

router.get("/", (req, res) => {
    const file = fs.readFileSync("./src/data/tech.yml", "utf8");
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