import { prisma } from '../../config/db.js';
import { verifyToken } from '../../middleware/verifyToken.js';
import express from "express";
import { checkSubmission } from '../../utils/checkSubmission.js';
const router = express.Router();

// Create submission for normal problem
router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { problemId, contestId, code, language } = req.body;

    if (!problemId || !code || !language) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        // add ai for calculate pints
        const response = await checkSubmission(problemId, code, language);
        const points = response.score;
        console.log(points)
        // by giving problem description , test case ,
        const submission = await prisma.submission.create({
            data: { userId, problemId, contestId, language, code, points }
        });


        res.status(200).json({
            success: true,
            message: "Submission successful",
            // submission
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

router.get('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const year = parseInt(req.query.year); // Changed from 'years' to 'year'

    try {
        // Get submissions for the specific year
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

        const submissions = await prisma.submission.findMany({
            where: {
                userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                createdAt: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // Group submissions by date and count them
        const activityMap = {};
        let totalSubmiisons = 0;

        submissions.forEach(submission => {
            const date = submission.createdAt.toISOString().split('T')[0]; // Format: YYYY-MM-DD

            if (activityMap[date]) {
                activityMap[date]++;
                totalSubmiisons++;
            } else {
                activityMap[date] = 1;
                totalSubmiisons++;
            }
        });

        // Convert to array format expected by frontend
        const activityData = Object.keys(activityMap).map(date => ({
            date: date,
            count: activityMap[date]
        }));

        res.status(200).json({
            success: true,
            activityData: activityData,// Frontend expects 'activityData' key
            totalSubmiisons: totalSubmiisons
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


export default router;
