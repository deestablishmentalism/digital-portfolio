import mongoose from "mongoose"

const skillSchema = new mongoose.Schema({
    skills: {
        frontend: {
            type: [String],
            required: true,
        },
        backend: {
            type: [String],
            required: true,
        },
        languages: {
            type: [String],
            required: true,
        },
        tools: {
            type: [String],
            required: true
        }
    }
},{timestamps: true});

export const Skill = new mongoose.model("Skill", skillSchema);