import mongoose from "mongoose"
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
const personalInfoSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: false
    },
    middle_name: {
        type: String,
        required: false
    },
    last_name: {
        type: String,
        required: false
    },
    summary: {
        type: String,
        required: false,
    },
    profile: imageSchema,
    address: {
        region: {
            type: String,
            required: false
        },
        province: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        barangay: {
            type: String,
            required: false
        },
        subdivision: {
            type: String,
            required: false
        },
        house_number: {
            type: Number,
            required: false
        }
    }
})
export const PersonalInfo = mongoose.model("PersonalInfo", personalInfoSchema)