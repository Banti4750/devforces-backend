import { Router } from "express";
import { createContestSchema, updateContestSchema } from "../../validations/contest.validation.js";
import { prisma } from "../../config/db.js";
import { verifyAdminToken } from "../../middleware/verifyToken.js";
const router = Router();

//add a new contest
router.post("/", verifyAdminToken, async (req, res) => {
    try {
        const { name, description, startTime, endTime, problems } = req.body;
        const authorId = req.user?.id;

        if (!name || !startTime || !endTime || !problems || problems.length === 0) {
            return res.status(400).json({ message: "Name, startTime, endTime, and at least one problem are required" });
        }
        const contest = await prisma.contest.create({
            data: {
                name,
                description,
                authorId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                duration: Math.floor(
                    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
                ),
                problems: {
                    create: problems.map((p) => ({
                        problemId: p.problemId,
                        index: p.index,
                        points: p.points,
                    })),
                },
            },
            include: { problems: { include: { problem: true } } },
        });

        res.status(201).json(contest);
    } catch (err) {
        res.status(500).json({ message: "Error creating contest", error: err.message });
    }
});


// PUT /contests/:id
router.put("/:id", verifyAdminToken, async (req, res) => {
    try {
        const { name, description, startTime, endTime, problems } = req.body;

        const contest = await prisma.contest.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                startTime: startTime ? new Date(startTime) : undefined,
                endTime: endTime ? new Date(endTime) : undefined,
                duration:
                    startTime && endTime
                        ? Math.floor(
                            (new Date(endTime).getTime() - new Date(startTime).getTime()) /
                            60000
                        )
                        : undefined,
            },
            include: { problems: true },
        });

        if (problems && problems.length > 0) {
            await prisma.contestProblem.deleteMany({
                where: { contestId: contest.id },
            });

            // Insert new mappings
            await prisma.contestProblem.createMany({
                data: problems.map((p) => ({
                    contestId: contest.id,
                    problemId: p.problemId,
                    index: p.index,
                    points: p.points,
                })),
            });
        }

        const updatedContest = await prisma.contest.findUnique({
            where: { id: contest.id },
            include: { problems: { include: { problem: true } } },
        });

        res.json(updatedContest);
    } catch (err) {
        res.status(500).json({ message: "Error updating contest", error: err.message });
    }
});

// DELETE /contests/:id
router.delete("/:id", verifyAdminToken, async (req, res) => {
    try {
        await prisma.contest.delete({ where: { id: req.params.id } });
        res.json({ message: "Contest deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting contest", error: err.message });
    }
});


//get all contests
router.get("/", verifyAdminToken, async (req, res) => {
    try {
        const contests = await prisma.contest.findMany({
            include: { problems: { include: { problem: true } } },
        });
        res.json(contests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching contests", error: err.message });
    }
});



// GET /contests/:id
router.get("/:id", verifyAdminToken, async (req, res) => {
    try {
        const contest = await prisma.contest.findUnique({
            where: { id: req.params.id },
            include: { problems: { include: { problem: true } } },
        });

        if (!contest) return res.status(404).json({ message: "Contest not found" });

        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: "Error fetching contest", error: err.message });
    }
});


// POST /contest-problems
router.post("/contest-problems", verifyAdminToken, async (req, res) => {
    try {
        const { contestId, problemId, index, points } = req.body;

        // Check if problem already exists in this contest
        const exists = await prisma.contestProblem.findUnique({
            where: {
                contestId_problemId: {
                    contestId,
                    problemId,
                },
            },
        });

        if (exists) {
            return res.status(400).json({
                message: "This problem is already added to the contest",
            });
        }

        // Check if index (A, B, C) already used in this contest
        const indexExists = await prisma.contestProblem.findUnique({
            where: {
                contestId_index: {
                    contestId,
                    index,
                },
            },
        });

        if (indexExists) {
            return res.status(400).json({
                message: `Index '${index}' is already used in this contest`,
            });
        }

        // Create new mapping
        const contestProblem = await prisma.contestProblem.create({
            data: { contestId, problemId, index, points },
            include: { problem: true, contest: true },
        });

        res.status(201).json(contestProblem);
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Error adding problem to contest", error: err.message });
    }
});


// PUT /contest-problems/:id
router.put("/contest-problems/:id", verifyAdminToken, async (req, res) => {
    try {
        const { index, points } = req.body;

        const updated = await prisma.contestProblem.update({
            where: { id: req.params.id },
            data: { index, points },
            include: { problem: true },
        });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Error updating contest problem", error: err.message });
    }
});


// DELETE /contest-problems/:id
router.delete("/contest-problems/:id", verifyAdminToken, async (req, res) => {
    try {
        await prisma.contestProblem.delete({ where: { id: req.params.id } });
        res.json({ message: "Problem removed from contest" });
    } catch (err) {
        res.status(500).json({ message: "Error removing problem", error: err.message });
    }
});



export default router;