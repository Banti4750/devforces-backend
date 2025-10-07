import express from "express";
const router = express.Router();
import { prisma } from "../../config/db.js";
import { verifyAdminToken } from "../../middleware/verifyToken.js";

// Get all queries
router.get("/", verifyAdminToken, async (req, res) => {
    try {
        const queries = await prisma.userQuery.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        res.status(200).json({ success: true, queries });
    } catch (error) {
        console.error("Error fetching queries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch queries.",
            error: error.message,
        });
    }
});

// Update query status
router.put("/:id", verifyAdminToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { status, adminReply } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Query ID is required." });
        }

        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required." });
        }

        // Get the query details before updating
        const existingQuery = await prisma.userQuery.findUnique({
            where: { id },
            include: {
                user: true // Assuming you have a relation to the user model
            }
        });

        if (!existingQuery) {
            return res.status(404).json({ success: false, message: "Query not found." });
        }

        const updatedQuery = await prisma.userQuery.update({
            where: { id },
            data: { status, adminReply },
        });

        // Send email notification if query is resolved
        if (status === 'resolved' && existingQuery.user?.email) {
            try {
                await sendQueryResolveEmail(
                    existingQuery.user.email,
                    existingQuery.user.name || 'User',
                    existingQuery.subject || 'Your Query',
                    existingQuery.message || existingQuery.query,
                    adminReply
                );
            } catch (emailError) {
                console.error('Failed to send email notification:', emailError);
                // Continue even if email fails
            }
        }

        res.status(200).json({
            success: true,
            message: "Query status updated successfully.",
            query: updatedQuery,
        });
    } catch (error) {
        console.error("Error updating query status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update query status.",
            error: error.message,
        });
    }
});

export default router;
