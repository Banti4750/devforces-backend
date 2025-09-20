import express from "express";
const router = express.Router();
import { prisma } from "../../config/db.js";
import { verifyToken } from "../../middleware/verifyToken.js";

// Register user for a contest
router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { contestId } = req.body;

    try {
        // Check if the user is already registered for this contest
        const isRegistered = await prisma.contestRegistration.findFirst({
            where: {
                userId,
                contestId
            }
        });

        if (isRegistered) {
            return res.status(400).json({
                success: false,
                message: "Already registered for this contest"
            });
        }

        // Create registration
        const registration = await prisma.contestRegistration.create({
            data: { userId, contestId }
        });

        res.status(200).json({
            success: true,
            message: "Registration successful",
            registration
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.contestRegistration.delete({ where: { id } });
        res.status(200).json({ success: true, message: "Registration deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


export default router;
