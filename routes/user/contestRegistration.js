import express from "express";
import moment from "moment";
const router = express.Router();
import { prisma } from "../../config/db.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { sendRegistrationEmail, sendUnregistrationEmail } from "../../utils/sendEmail.js";

router.post("/", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { contestId } = req.body;

    try {
        // Check if already registered
        const isRegistered = await prisma.contestRegistration.findFirst({
            where: { userId, contestId },
        });

        if (isRegistered) {
            return res.status(400).json({
                success: false,
                message: "Already registered for this contest",
            });
        }

        // Fetch user & contest
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const contest = await prisma.contest.findUnique({ where: { id: contestId } });
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }

        const now = new Date();

        // Registration only allowed before contest starts
        if (contest.startTime && contest.startTime.getTime() <= now.getTime()) {
            return res.status(403).json({
                success: false,
                message: "Registration closed. Contest already started.",
            });
        }

        // If contest already ended
        if (contest.endTime && contest.endTime.getTime() < now.getTime()) {
            return res.status(403).json({
                success: false,
                message: "Registration closed. Contest already ended.",
            });
        }

        // Create registration
        const registration = await prisma.contestRegistration.create({
            data: { userId, contestId },
        });

        // Format email content
        const startDate = moment(contest.startTime).format("MMMM D, YYYY");
        const startTime = moment(contest.startTime).format("hh:mm A");

        // Send email
        // await sendRegistrationEmail(
        //     user.email,
        //     user.name || "Ghost",
        //     contest.name,
        //     startDate,
        //     startTime
        // );

        res.status(200).json({
            success: true,
            message: "Registration successful",
            data: {
                registration,
                contest: {
                    id: contest.id,
                    name: contest.name,
                    startDate,
                    startTime,
                },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});

router.delete("/", verifyToken, async (req, res) => {
    const { id } = req.body;
    const userId = req.user.id;

    try {
        // Find registration and check ownership
        const registration = await prisma.contestRegistration.findUnique({
            where: { id },
            include: {
                contest: true,
                user: true,
            },
        });

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found",
            });
        }

        if (registration.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this registration",
            });
        }

        const now = new Date();

        // Prevent unregistration after contest starts
        if (registration.contest.startTime && registration.contest.startTime.getTime() <= now.getTime()) {
            return res.status(403).json({
                success: false,
                message: "Unregistration closed. Contest already started.",
            });
        }

        // Delete registration
        await prisma.contestRegistration.delete({ where: { id } });

        // Format date for email
        const startDate = moment(registration.contest.startTime).format("MMMM D, YYYY");
        const startTime = moment(registration.contest.startTime).format("hh:mm A");

        // Send email
        // await sendUnregistrationEmail(
        //     registration.user.email,
        //     registration.user.name || "Ghost",
        //     registration.contest.name,
        //     startDate,
        //     startTime
        // );

        res.status(200).json({
            success: true,
            message: "Registration deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});

export default router;
