import mongoose from "mongoose";
import { WorkExperience } from "../models/workExperience.js";

function buildPayload(body) {
    const { work_title, company, description, start_date, end_date } = body;
    return {
        work_title: typeof work_title === "string" ? work_title.trim() : work_title,
        company: typeof company === "string" ? company.trim() : company,
        description: typeof description === "string" ? description.trim() : "",
        start_date: start_date || undefined,
        end_date: end_date || null,
    };
}

function handleError(res, error) {
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    res.status(500).json({
        success: false,
        message: "Internal server error: " + error.message
    });
}

export async function getAllWorkExperiences(req, res) {
    try {
        // Most recent / ongoing roles first
        const workExperiences = await WorkExperience.find({}).sort({ start_date: -1 });
        res.status(200).json({
            success: true,
            data: workExperiences
        });
    }
    catch(error) {
        handleError(res, error);
    }
}

export async function createWorkExperience(req, res) {
    try {
        const workExperience = await WorkExperience.create(buildPayload(req.body));
        res.status(201).json({
            success: true,
            message: "Successfully added work experience!",
            data: workExperience
        });
    }
    catch(error) {
        handleError(res, error);
    }
}

export async function updateWorkExperience(req, res) {
    try {
        const workExperience = await WorkExperience.findById(req.params.id);
        if(!workExperience) {
            return res.status(404).json({
                success: false,
                message: "Work experience not found!"
            });
        }
        workExperience.set(buildPayload(req.body));
        await workExperience.save();
        res.status(200).json({
            success: true,
            message: "Successfully updated work experience!",
            data: workExperience
        });
    }
    catch(error) {
        handleError(res, error);
    }
}

export async function deleteWorkExperience(req, res) {
    try {
        const workExperience = await WorkExperience.findByIdAndDelete(req.params.id);
        if(!workExperience) {
            return res.status(404).json({
                success: false,
                message: "Work experience not found!"
            });
        }
        res.status(200).json({
            success: true,
            message: "Work experience deleted successfully",
            data: workExperience
        });
    }
    catch(error) {
        handleError(res, error);
    }
}

