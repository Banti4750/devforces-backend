import express from "express";
import { prisma } from "../../config/db.js";
import { verifyAdminToken } from "../../middleware/verifyToken.js";

const router = express.Router();

// Create a new problem
// const createProblem = async (req, res) => {
//     try {
//         const { title, description, difficulty, taskType, technologies, starterCode, solution, tags } = req.body;
//         const authorId = req.user?.id;

//         const problem = await prisma.problem.create({
//             data: {
//                 title,
//                 description,
//                 difficulty,
//                 taskType,
//                 technologies,
//                 starterCode,
//                 solution,
//                 authorId,
//                 tags: tags
//                     ? {
//                         create: tags.map((tagId) => ({ tagId })),
//                     }
//                     : undefined,
//             },
//             include: { tags: { include: { tag: true } } },
//         });

//         res.status(201).json({ success: true, problem });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Failed to create problem", error: error.message });
//     }
// };

const createProblem = async (req, res) => {
    try {
        const { title, description, difficulty, taskType, technologies, starterCode, solution, tags, testCases } = req.body;
        const authorId = req.user?.id;

        const problem = await prisma.problem.create({
            data: {
                title,
                description,
                difficulty,
                taskType,
                technologies,
                starterCode,
                solution,
                authorId,
                tags: tags
                    ? {
                        create: tags.map((tagId) => ({ tagId })),
                    }
                    : undefined,
                testCases: testCases
                    ? {
                        create: testCases.map(tc => ({
                            input: tc.input,
                            expectedOutput: tc.expectedOutput,
                            isPublic: tc.isPublic,
                            explanation: tc.explanation
                        }))
                    }
                    : undefined,
            },
            include: {
                tags: { include: { tag: true } },
                testCases: true
            },
        });

        res.status(201).json({ success: true, problem });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create problem", error: error.message });
    }
};

// Get all problems
const getProblems = async (req, res) => {
    try {
        const problems = await prisma.problem.findMany({
            include: {
                tags: { include: { tag: true } },
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
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, problems });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch problems", error: error.message });
    }
};

//  Get problem by ID
const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await prisma.problem.findUnique({
            where: { id },
            include: {
                tags: { include: { tag: true } },
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

// Update problem
const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, difficulty, taskType, technologies, starterCode, solution, tags } = req.body;

        const problem = await prisma.problem.update({
            where: { id },
            data: {
                title,
                description,
                difficulty,
                taskType,
                technologies,
                starterCode,
                solution,
                ...(tags && {
                    tags: {
                        deleteMany: {}, // clear old tags
                        create: tags.map((tagId) => ({ tagId })),
                    },
                }),
            },
            include: { tags: { include: { tag: true } } },
        });

        res.json({ success: true, problem });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }
        res.status(500).json({ success: false, message: "Failed to update problem", error: error.message });
    }
};

//  Delete problem
const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if problem exists
        const problem = await prisma.problem.findUnique({ where: { id } });
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        // Delete all related submissions first
        await prisma.$transaction([
            prisma.submission.deleteMany({ where: { problemId: id } }),
            prisma.problem.delete({ where: { id } }),
        ]);

        res.json({ success: true, message: "Problem and related submissions deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting problem:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete problem",
            error: error.message,
        });
    }
};

// Add one/multiple tags to a problem
const addTagsToProblem = async (req, res) => {
    try {
        const { id } = req.params;
        // array of tagIds
        const { tags } = req.body;

        const updated = await prisma.problem.update({
            where: { id },
            data: {
                tags: {
                    create: tags.map((tagId) => ({ tagId })),
                },
            },
            include: { tags: { include: { tag: true } } },
        });

        res.status(201).json({ success: true, problem: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add tags", error: error.message });
    }
};

// Get all tags for a problem
const getTagsForProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await prisma.problem.findUnique({
            where: { id },
            include: { tags: { include: { tag: true } } },
        });

        if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });

        res.json({ success: true, tags: problem.tags.map((t) => t.tag) });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch tags", error: error.message });
    }
};

// Remove a tag from a problem
const removeTagFromProblem = async (req, res) => {
    try {
        const { id, tagId } = req.params;

        await prisma.problemTag.deleteMany({
            where: { problemId: id, tagId },
        });

        res.json({ success: true, message: "Tag removed from problem" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to remove tag", error: error.message });
    }
};


router.post("/", verifyAdminToken, createProblem);
router.get("/", getProblems);
router.get("/:id", getProblemById);
router.put("/:id", verifyAdminToken, updateProblem);
router.delete("/:id", verifyAdminToken, deleteProblem);

// Problem ↔ Tag endpoints
router.post("/:id/tags", verifyAdminToken, addTagsToProblem); // add tags
router.get("/:id/tags", getTagsForProblem);                   // get tags
router.delete("/:id/tags/:tagId", verifyAdminToken, removeTagFromProblem); // remove one tag

export default router;
