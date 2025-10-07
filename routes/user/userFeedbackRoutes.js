import express from "express";
const router = express.Router();
import { prisma } from "../../config/db.js";
import { verifyToken } from "../../middleware/verifyToken.js";

// POST /api/feedback
export const postFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { feedback, rating } = req.body;

        // Validation
        if (!userId || !feedback) {
            return res
                .status(400)
                .json({ success: false, message: "Feedback and rating are required." });
        }

        if (rating < 1 || rating > 5) {
            return res
                .status(400)
                .json({ success: false, message: "Rating must be between 1 and 5." });
        }

        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const newFeedback = await prisma.userFeedback.create({
            data: {
                userId,
                feedback,
                rating,
            },
        });

        // Send thank you email
        try {
            await sendFeedbackEmail(
                user.email,
                user.name || 'Valued User',
                rating,
                feedback
            );
        } catch (emailError) {
            console.error('Failed to send thank you email:', emailError);
            // Continue even if email fails
        }

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully. Thank you!",
            feedback: newFeedback,
        });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit feedback.",
            error: error.message,
        });
    }
};
router.post("/", verifyToken, postFeedback);

export default router;
