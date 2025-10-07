import express from "express";
const router = express.Router();
import { prisma } from "../../config/db.js";
import { verifyToken } from "../../middleware/verifyToken.js";

// POST /api/query
export const postQuery = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, message } = req.body;

        // Validate required fields
        if (!userId || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Subject and message are required.",
            });
        }

        const newQuery = await prisma.userQuery.create({
            data: {
                userId,
                subject,
                message,
                status: "pending",
            },
        });

        res.status(201).json({
            success: true,
            message: "Query submitted successfully.",
            query: newQuery,
        });
    } catch (error) {
        console.error("Error submitting query:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit query.",
            error: error.message,
        });
    }
};

router.post("/", verifyToken, postQuery);

export default router;
