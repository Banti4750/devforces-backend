import express from "express";
const router = express.Router();
import { prisma } from "../../config/db.js";
import { verifyAdminToken } from "../../middleware/verifyToken.js";

// Get all feedbacks
router.get("/", verifyAdminToken, async (req, res) => {
    try {
        const feedbacks = await prisma.userFeedback.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.status(200).json({ success: true, feedbacks });
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch feedbacks.",
            error: error.message,
        });
    }
});

// Delete a feedback by ID
router.delete("/:id", verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Feedback ID is required." });
        }

        // Check if feedback exists before deleting
        const existingFeedback = await prisma.userFeedback.findUnique({ where: { id } });
        if (!existingFeedback) {
            return res.status(404).json({ success: false, message: "Feedback not found." });
        }

        await prisma.userFeedback.delete({ where: { id } });

        res.status(200).json({ success: true, message: "Feedback deleted successfully." });
    } catch (error) {
        console.error("Error deleting feedback:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete feedback.",
            error: error.message,
        });
    }
});

export default router;
