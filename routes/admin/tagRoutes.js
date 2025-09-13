import express from "express";
const router = express.Router();
import { verifyAdminToken } from "../../middleware/verifyToken.js";
import { prisma } from "../../config/db.js";

//  Create a new tag
export const createTag = async (req, res) => {
    try {
        const { name } = req.body;

        const tag = await prisma.tag.create({
            data: { name },
        });

        res.status(201).json({ success: true, tag });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ success: false, message: "Tag already exists" });
        }
        res.status(500).json({ success: false, message: "Failed to create tag", error: error.message });
    }
};

//  Get all tags
export const getTags = async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, tags });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch tags", error: error.message });
    }
};

// Get tag by ID
export const getTagById = async (req, res) => {
    try {
        const { id } = req.params;

        const tag = await prisma.tag.findUnique({
            where: { id },
        });

        if (!tag) return res.status(404).json({ success: false, message: "Tag not found" });

        res.json({ success: true, tag });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch tag", error: error.message });
    }
};

//  Update tag
export const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const tag = await prisma.tag.update({
            where: { id },
            data: { name },
        });

        res.json({ success: true, tag });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Tag not found" });
        }
        res.status(500).json({ success: false, message: "Failed to update tag", error: error.message });
    }
};

//  Delete tag
export const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.tag.delete({
            where: { id },
        });

        res.json({ success: true, message: "Tag deleted" });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Tag not found" });
        }
        res.status(500).json({ success: false, message: "Failed to delete tag", error: error.message });
    }
};


router.post("/", verifyAdminToken, createTag);
router.get("/", getTags);
router.get("/:id", getTagById);
router.put("/:id", verifyAdminToken, updateTag);
router.delete("/:id", verifyAdminToken, deleteTag);

export default router;