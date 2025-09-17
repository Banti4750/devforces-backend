import express from "express";
const router = express.Router();
import { verifyAdminToken } from "../../middleware/verifyToken.js";
import { prisma } from "../../config/db.js";

// Create a new test case
const createTestCase = async (req, res) => {
    try {
        const { problemId, input, expectedOutput, isPublic, explanation } = req.body;

        if (!problemId || !input || !expectedOutput || typeof isPublic !== "boolean" || !explanation) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const testcase = await prisma.testCase.create({
            data: {
                problemId,
                input,
                expectedOutput,
                isPublic,
                explanation,
            },
        });

        res.status(201).json({ success: true, testcase });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create testcase", error: error.message });
    }
};

// Get all test cases
const getTestCases = async (req, res) => {
    try {
        const testcases = await prisma.testCase.findMany();
        res.json({ success: true, testcases });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch testcases", error: error.message });
    }
};

// Get testcases by problemId
const getTestcaseByProblemId = async (req, res) => {
    const { problemId } = req.params;
    try {
        const testcases = await prisma.testCase.findMany({
            where: { problemId },
        });

        if (!testcases || testcases.length === 0) {
            return res.status(404).json({ success: false, message: "No testcases related to this problem" });
        }

        res.status(200).json({ success: true, testcases });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch testcases", error: error.message });
    }
};

// Get testcase by ID
const getTestCaseById = async (req, res) => {
    try {
        const { id } = req.params;

        const testcase = await prisma.testCase.findUnique({
            where: { id },
        });

        if (!testcase) return res.status(404).json({ success: false, message: "Testcase not found" });

        res.json({ success: true, testcase });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch testcase", error: error.message });
    }
};

// Update testcase
const updateTestCase = async (req, res) => {
    try {
        const { id } = req.params;
        const { input, expectedOutput, isPublic, explanation } = req.body;

        const testcase = await prisma.testCase.update({
            where: { id },
            data: {
                ...(input && { input }),
                ...(expectedOutput && { expectedOutput }),
                ...(typeof isPublic === "boolean" && { isPublic }),
                ...(explanation && { explanation }),
            },
        });

        res.json({ success: true, testcase });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Testcase not found" });
        }
        res.status(500).json({ success: false, message: "Failed to update testcase", error: error.message });
    }
};

// Delete testcase
const deleteTestCase = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.testCase.delete({
            where: { id },
        });

        res.json({ success: true, message: "Testcase deleted" });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Testcase not found" });
        }
        res.status(500).json({ success: false, message: "Failed to delete testcase", error: error.message });
    }
};

// Routes
router.post("/", verifyAdminToken, createTestCase);
router.get("/", getTestCases);
router.get("/:id", getTestCaseById);
router.put("/:id", verifyAdminToken, updateTestCase);
router.delete("/:id", verifyAdminToken, deleteTestCase);
router.get("/problem/:problemId", getTestcaseByProblemId);

export default router;
