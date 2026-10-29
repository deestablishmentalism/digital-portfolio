import mongoose from "mongoose"

const workExperienceSchema = new mongoose.Schema({
        work_title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: false,
            trim: true,
            default: ""
        },
        start_date: {
            type: Date,
            required: true
        },
        // A null end_date means the position is still ongoing ("Present")
        end_date: {
            type: Date,
            required: false,
            default: null,
            validate: {
                validator: function (value) {
                    return !value || !this.start_date || value >= this.start_date;
                },
                message: "End date cannot be earlier than the start date"
            }
        }
    },
    {timestamps: true}
);
export const WorkExperience = mongoose.model("WorkExperience", workExperienceSchema);

