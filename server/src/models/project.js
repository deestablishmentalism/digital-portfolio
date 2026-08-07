import mongoose from 'mongoose'
const imageSchema = new mongoose.Schema(
    {
        public_id: { 
            type: String, 
            required: true 
        },
        url: { 
            type: String, 
            required: true 
        },
        secure_url: { 
            type: String, 
            required: true 
        },
        width: Number,
        height: Number,
        format: String,
        bytes: Number,
    },
    {_id: false}
);
const projectSchema = new mongoose.Schema(
    {
        project_name: {
            type: String,
            required: true,
        },
        project_description: {
            type: String,
            required: true,
        },
        project_start_date: {
            type: Date,
            required: true,
        },
        project_end_date: {
            type: String,
            required: true,
        },
        project_type: {
            type: String,
            required: true,
        },
        preview: {
            type: {
                type: String,
                enum: ["url", "gallery"],
                required: true
            },

            url: {
                type: String
            },
            images: [imageSchema]
        },
        languages: {
            type: [String],
            required: true,
        },
    },
    {timestamps: true}
);
export const Project = mongoose.model("Project", projectSchema);