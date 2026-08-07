import express from "express"
import fs from "fs"
import { load } from "js-yaml"

const router = express.Router();

router.get("/",(req, res)=> {
    const file = fs.readFileSync("./src/data/socials.yml","utf-8");
    const data = load(file);
    res.json(data);
})
export default router;