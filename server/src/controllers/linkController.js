import { Link } from "../models/link.js"

export async function getAllLinks(req, res) {
    try {
        const links = await Link.find({});
        res.status(200).json(links);
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: "+ error.message
        });
    }
}
export async function createLink(req, res) {
    try {
        const {social, link, in_footer, in_contact} = req.body;

        const createLink = await Link.create({
            social,
            link,
            in_footer,
            in_contact,
        });
        if(!link) throw new Error("Failed to create this link");
        res.status(201).json({
            success: true,
            message: "Successfully created link!",
            data: createLink
        });
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });        
    }
}
export async function getFooterLinks(req, res) {
    try {
        const footerLinks = await Link.find({in_footer: true});
        res.status(200).json(footerLinks);
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });   
    }
}
export async function getContactLinks(req,res) {
    try {
        const contactLinks = await Link.find({in_contact: true});
        res.status(200).json(contactLinks);
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });  
    }
}
export async function saveFooterLinks(req, res) {
    try {
        const {ids} = req.body;
        const linkIds = Array.isArray(ids) ? ids : [];
        await Link.updateMany({}, {in_footer: false});
        if (linkIds.length > 0) {
            await Link.updateMany({_id: {$in: linkIds}}, {in_footer: true});
        }
        const links = await Link.find({});
        res.status(200).json(links);
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });   
    }
}
export async function saveLink(req, res) {
    try {
        const {_id, link, in_footer,in_contact} = req.body;
        const targetLink = await Link.findById(_id);
        if (!targetLink) {
            return res.status(404).json({
                success: false,
                message: "Target link not found!"
            });
        }
        targetLink.link = link;
        targetLink.in_footer = in_footer;
        targetLink.in_contact = in_contact;
        await targetLink.save();
        res.status(200).json({
            success: true,
            message: "Successfully updated link!",
            data: targetLink
        });
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        })
    }
}