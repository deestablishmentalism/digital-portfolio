import { Skill } from "../models/skill.js";

const EMPTY = { frontend: [], backend: [], langauges: [], tools: [] };

export async function getSkills(req, res) {
    try {
        const skill = await Skill.findOne();
        res.status(200).json(skill ? skill.skills : EMPTY);
    } catch (error) {
        console.error(`Error in getSkills: ${error.message}`);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function saveSkills(req, res) {
    try {
        const { frontend, backend, langauges, tools } = req.body?.skills || {};
        const skills = {
            frontend: frontend || [],
            backend: backend || [],
            langauges: langauges || [],
            tools: tools || [],
        };
        const updated = await Skill.findOneAndUpdate({}, { skills }, { new: true, upsert: true });
        res.status(200).json(updated.skills);
    } catch (error) {
        console.error(`Error in saveSkills: ${error.message}`);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
