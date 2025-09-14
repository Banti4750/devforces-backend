
import express from "express";
const router = express.Router();
import { prisma } from "../../config/db.js";

//  Get all problems
const getProblems = async (req, res) => {
    try {
        const problems = await prisma.problem.findMany({
            include: {
                tags: true,
                testCases: true,
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePic: true,
                        country: true,
                        organization: true,
                        isVerified: true,
                    },
                },
            },
        });

        res.json({ success: true, problems });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch problems",
            error: error.message,
        });
    }
};


// Get problem by ID
const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await prisma.problem.findUnique({
            where: { id },
            include: {
                tags: true,
                testCases: true,
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePic: true,
                        country: true,
                        organization: true,
                        isVerified: true,
                    },
                },
            },
        });

        if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });
        res.json({ success: true, problem });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch problem", error: error.message });
    }
};

router.get("/", getProblems);
router.get("/:id", getProblemById);

export default router;