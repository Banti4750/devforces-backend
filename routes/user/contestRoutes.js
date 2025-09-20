import { Router } from "express";
import { prisma } from "../../config/db.js";
const router = Router();


//get all contests
router.get("/", async (req, res) => {
    try {
        const contests = await prisma.contest.findMany({
            include: {
                problems: {
                    include: {
                        problem: true,
                    }
                },
                registrations: true
            }
        });
        res.json(contests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching contests", error: err.message });
    }
});


// GET /contests/:id
router.get("/:id", async (req, res) => {
    try {
        const contest = await prisma.contest.findUnique({
            where: { id: req.params.id },
            include: {
                problems: {
                    include: {
                        problem: true,
                    }
                },
                registrations: true
            }
        });

        if (!contest) return res.status(404).json({ message: "Contest not found" });

        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: "Error fetching contest", error: err.message });
    }
});

export default router;