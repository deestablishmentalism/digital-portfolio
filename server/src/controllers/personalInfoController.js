import { v2 as cloudinary } from "cloudinary";
import {PersonalInfo} from '../models/personalInfo.js'

export async function getPersonalInfo(req, res) {
    try {
        const personalInfo = await PersonalInfo.findOne({});
        if(!personalInfo) {
            return res.status(404).json({
                success: false,
                message: "No personal information found"
            });
        }
        res.status(200).json({
            success: true,
            data: personalInfo
        });
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
}

export async function updatePersonalInfo(req, res) {
    try {
        const { first_name, middle_name, last_name, summary, address } = req.body;
        let personalInfo = await PersonalInfo.findOne({});
        if(!personalInfo) {
            personalInfo = new PersonalInfo({});
        }
        personalInfo.first_name = first_name;
        personalInfo.middle_name = middle_name;
        personalInfo.last_name = last_name;
        personalInfo.summary = summary;
        if(address) {
            const newAddress = {
                region: address.region || "",
                province: address.province || "",
                city: address.city || "",
                barangay: address.barangay || "",
                subdivision: address.subdivision || "",
            };
            if(address.house_number !== "" && address.house_number != null) {
                newAddress.house_number = Number(address.house_number);
            }
            personalInfo.address = newAddress;
        }
        await personalInfo.save();
        res.status(200).json({
            success: true,
            data: personalInfo
        });
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
}

export async function uploadProfilePicture(req, res) {
    try {
        const { image } = req.body;
        if(!image) {
            return res.status(400).json({
                success: false,
                message: "No image provided"
            });
        }

        let personalInfo = await PersonalInfo.findOne({});

        if(personalInfo?.profile?.public_id) {
            await cloudinary.uploader.destroy(personalInfo.profile.public_id);
        }

        const result = await cloudinary.uploader.upload(image, {
            folder: "profiles",
            transformation: [{ width: 800, crop: "limit", quality: "auto", fetch_format: "auto" }]
        });
        const profile = {
            public_id: result.public_id,
            url: result.url,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        };

        if(personalInfo) {
            personalInfo.profile = profile;
            await personalInfo.save();
        }
        else {
            personalInfo = await PersonalInfo.create({ profile });
        }

        res.status(200).json({
            success: true,
            data: personalInfo
        });
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
}