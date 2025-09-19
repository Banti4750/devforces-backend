
import express from "express";
const router = express.Router();
import { prisma } from "../../config/db.js";

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

// get category
export const getCategory = async (req, res) => {
    try {
        const problems = await prisma.problem.findMany({
        });

        const category = [
            "ALL",
            ...new Set(problems.map(p => p.taskType || "General"))
        ].map(category => ({ category }));

        res.status(200).json({ success: true, category });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: "Failed to fetch category",
            error: error.message
        });
    }
};



router.get("/", getTags);
router.get("/category", getCategory);
router.get("/:id", getTagById);

export default router;