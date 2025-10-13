import express from "express";
import { verifyToken } from "../../middleware/verifyToken.js";
import { prisma } from "../../config/db.js";
import moment from "moment";

const router = express.Router();

// Get user progress
router.get("/progress", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        //  Fetch all submissions by this user
        const submissions = await prisma.submission.findMany({
            where: { userId },
            include: {
                problem: {
                    select: { id: true, difficulty: true },
                },
            },
        });

        // Use Sets to count unique solved problems per difficulty
        const easySet = new Set();
        const mediumSet = new Set();
        const hardSet = new Set();

        for (const sub of submissions) {
            if (!sub.problem) continue; // skip null relations

            const problemId = sub.problem.id;
            const difficulty = sub.problem.difficulty;

            // Add to corresponding set
            if (difficulty === "EASY") easySet.add(problemId);
            else if (difficulty === "MEDIUM") mediumSet.add(problemId);
            else if (difficulty === "HARD") hardSet.add(problemId);
        }

        //  Fetch user rank
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { maxRank: true },
        });

        res.status(200).json({
            success: true,
            easy: easySet.size,
            medium: mediumSet.size,
            hard: hardSet.size,
            totalSolved: easySet.size + mediumSet.size + hardSet.size,
            maxRank: user?.maxRank || "Unranked",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


//recent activity of user
router.get("/activity", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch the last 10 submissions (you can adjust `take`)
        const submissions = await prisma.submission.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
                problem: {
                    select: { id: true, title: true, difficulty: true },
                },
            },
        });

        // Format response
        const recentActivity = submissions.map((sub) => ({
            problemId: sub.problem?.id,
            title: sub.problem?.title || "Unknown Problem",
            difficulty: sub.problem?.difficulty || "Unknown",
            status: sub.status,
            language: sub.language || "N/A",
            submittedAt: moment(sub.createdAt).format("MMMM DD, YYYY"),
        }));

        res.status(200).json({ success: true, recentActivity });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch recent activity",
            error: error.message,
        });
    }
});



export default router;
