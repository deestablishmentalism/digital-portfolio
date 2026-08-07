import mongoose from "mongoose"

const linkSchema = new mongoose.Schema({
    
        social: {
            type: String,
            required: true
        },
        link: {
            type: String,
            required: true
        },
        in_footer: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {timestamps: true}
);
export const Link = mongoose.model("Link", linkSchema);