import { prisma } from '../../config/db.js';
import { verifyToken } from '../../middleware/verifyToken.js';
import express from "express";
const router = express.Router();

// Create submission for normal problem
router.post('/', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { problemId, contestId, code, language, points } = req.body;

    if (!problemId || !code || !language) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {

        // TODO:add ai for calculate pints
        // by giving problem description , test case ,
        const submission = await prisma.submission.create({
            data: { userId, problemId, contestId, language, code, points }
        });

        res.status(200).json({
            success: true,
            message: "Submission successful",
            submission
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
