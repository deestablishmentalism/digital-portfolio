import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { Project } from "../models/project.js";

const PREVIEW_TYPES = ["url", "gallery"];

// Accepts a mix of already-uploaded Cloudinary image objects (kept as-is)
// and base64 data URLs (uploaded to Cloudinary).
async function processPreviewImages(images) {
    if (!Array.isArray(images) || images.length === 0) return [];
    return Promise.all(
        images.map(async (img) => {
            if (img && typeof img === "object" && img.public_id && img.secure_url) {
                return {
                    public_id: img.public_id,
                    url: img.url || img.secure_url,
                    secure_url: img.secure_url,
                    width: img.width,
                    height: img.height,
                    format: img.format,
                    bytes: img.bytes,
                };
            }
            if (typeof img === "string" && img.startsWith("data:")) {
                const r = await cloudinary.uploader.upload(img, { folder: "projects" });
                return {
                    public_id: r.public_id,
                    url: r.url,
                    secure_url: r.secure_url,
                    width: r.width,
                    height: r.height,
                    format: r.format,
                    bytes: r.bytes,
                };
            }
            throw new Error("Invalid image provided");
        })
    );
}

// Best-effort cleanup: a failed Cloudinary delete should not fail the request
async function destroyImages(publicIds) {
    await Promise.allSettled(publicIds.map((id) => cloudinary.uploader.destroy(id)));
}

function sendError(res, fnName, error) {
    console.error(`Error occured in ${fnName} function: ${error.message}`);
    const isClientError =
        error instanceof mongoose.Error.ValidationError ||
        error instanceof mongoose.Error.CastError ||
        error.statusCode === 400;
    res.status(isClientError ? 400 : 500).json({
        success: false,
        message: isClientError ? error.message : "Internal server error: " + error.message
    });
}

function validatePreview(preview) {
    if (!preview || !PREVIEW_TYPES.includes(preview.type)) {
        const error = new Error("A valid preview type (url or gallery) is required");
        error.statusCode = 400;
        throw error;
    }
}

export async function getAllProjects(req, res) {
    try {
        const projects = await Project.find({});
        res.status(200).json(projects);
    }
    catch(error) {
        console.error(`Error occured in getAllProjects function: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export async function createProject(req,res) {
    try {
        const { project_name, project_description, project_start_date, project_end_date, project_type, languages, preview } = req.body;
        validatePreview(preview);

        const images = await processPreviewImages(preview.images);

        const project = await Project.create({
            project_name,
            project_description,
            project_start_date,
            project_end_date,
            project_type,
            languages,
            preview: {
                type: preview.type,
                url: preview.type === "url" ? preview.url : undefined,
                images,
            },
        });

        res.status(201).json({ success: true, message: "Project created successfully!", data: project });
    }
    catch(error) {
        sendError(res, "createProject", error);
    }
}

export async function updateProject(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found!"
            });
        }

        const { project_name, project_description, project_start_date, project_end_date, project_type, languages, preview } = req.body;
        validatePreview(preview);

        const previousPublicIds = (project.preview?.images || []).map((img) => img.public_id);
        const images = await processPreviewImages(preview.images);

        project.set({
            project_name,
            project_description,
            project_start_date,
            project_end_date,
            project_type,
            languages,
            preview: {
                type: preview.type,
                url: preview.type === "url" ? preview.url : undefined,
                images,
            },
        });
        await project.save();

        // Remove images that were replaced or removed during the edit
        const keptPublicIds = new Set(images.map((img) => img.public_id));
        await destroyImages(previousPublicIds.filter((id) => !keptPublicIds.has(id)));

        res.status(200).json({ success: true, message: "Project updated successfully!", data: project });
    }
    catch(error) {
        sendError(res, "updateProject", error);
    }
}

export async function deleteProject(req, res) {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found!"
            });
        }

        await destroyImages((project.preview?.images || []).map((img) => img.public_id));

        res.status(200).json({ success: true, message: "Project deleted successfully!", data: project });
    }
    catch(error) {
        sendError(res, "deleteProject", error);
    }
}
