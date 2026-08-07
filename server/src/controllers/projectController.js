import { v2 as cloudinary } from "cloudinary";
import { Project } from "../models/project.js";

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

        if (preview.type === "gallery") {
            const uploadPromises = preview.images.map((img) =>
                cloudinary.uploader.upload(img, { folder: "projects" })
            );
            const results = await Promise.all(uploadPromises);
            preview.images = results.map((r) => ({
                public_id: r.public_id,
                url: r.url,
                secure_url: r.secure_url,
                width: r.width,
                height: r.height,
                format: r.format,
                bytes: r.bytes,
            }));
        }

        const project = await Project.create({
            project_name,
            project_description,
            project_start_date,
            project_end_date,
            project_type,
            languages,
            preview,
        });

        res.status(201).json({ success: true, data: project });
    }
    catch(error) {
        console.error(`Error occured in createProject function: ${error.message}`);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}