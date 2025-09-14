import express from "express";
import { prisma } from "../../config/db.js";
import { verifyAdminToken } from "../../middleware/verifyToken.js";
const router = express.Router();

//  Create a new problem
const createProblem = async (req, res) => {
    try {
        const { title, description, difficulty, taskType, technologies, starterCode, solution } = req.body;
        const authorId = req.user?.id; // from auth middleware

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
            },
        });

        res.status(201).json({ success: true, problem });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create problem", error: error.message });
    }
};

//  Get all problems
const getProblems = async (req, res) => {
    try {
        const problems = await prisma.problem.findMany({
            include: { tags: true, testCases: true, author: true },
        });

        res.json({ success: true, problems });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch problems", error: error.message });
    }
};

// Get problem by ID
const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const problem = await prisma.problem.findUnique({
            where: { id },
            include: { tags: true, testCases: true, author: true },
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
        const { title, description, difficulty, taskType, technologies, starterCode, solution } = req.body;

        const problem = await prisma.problem.update({
            where: { id },
            data: { title, description, difficulty, taskType, technologies, starterCode, solution },
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
        await prisma.problem.delete({ where: { id } });
        res.json({ success: true, message: "Problem deleted" });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }
        res.status(500).json({ success: false, message: "Failed to delete problem", error: error.message });
    }
};

router.post("/", verifyAdminToken, createProblem);
router.get("/", getProblems);
router.get("/:id", getProblemById);
router.put("/:id", verifyAdminToken, updateProblem);
router.delete("/:id", verifyAdminToken, deleteProblem);

export default router;