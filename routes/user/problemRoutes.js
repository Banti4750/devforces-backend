
import express from "express";
const router = express.Router();
import { prisma } from "../../config/db.js";
import { verifyToken } from "../../middleware/verifyToken.js";

//  Get all problems
// Get all problems
const getProblems = async (req, res) => {
    const { category, difficulty, tags } = req.body;

    try {
        const problems = await prisma.problem.findMany({
            where: {
                ...(category && category !== "ALL" ? { taskType: category } : {}),
                ...(difficulty && difficulty !== "ALL" ? { difficulty } : {}),
                ...(tags && tags.length > 0
                    ? {
                        tags: {
                            some: {
                                tag: {
                                    name: { in: tags },
                                },
                            },
                        },
                    }
                    : {}),
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                submissions: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        const formattedProblems = problems.map((p, index) => ({
            sn: index + 1,
            id: p.id,
            title: p.title,
            category: p.taskType || "General",
            difficulty: p.difficulty || "Unknown",
            status: p.submissions?.length > 0 ? "solved" : "unsolved",
            tags: p.tags?.map((t) => t.tag.name) || [],
        }));

        res.json({ success: true, problems: formattedProblems });
    } catch (error) {
        console.error(error.message);
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
                tags: {
                    include: {
                        tag: true, // fetch full tag info
                    },
                },
                testCases: true,
                author: {
                    select: {
                        name: true,
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

//number of problem solved by user


router.post("/", verifyToken, getProblems);
router.get("/:id", verifyToken, getProblemById);

export default router;