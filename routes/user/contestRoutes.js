import { Router } from "express";
import { prisma } from "../../config/db.js";
import moment from "moment";
const router = Router();


//get all contests
router.get("/", async (req, res) => {
    try {
        const contests = await prisma.contest.findMany({
            include: {
                problems: {
                    include: {
                        problem: true,
                    },
                },
                registrations: true,
                author: {
                    select: { email: true, name: true },
                },
            },
        });

        const formatted = contests.map((contest, index) => {
            const start = moment(contest.startTime).format("MMM DD, YYYY HH:mm");
            const hours = Math.floor(contest.duration / 60);
            const minutes = contest.duration % 60;
            const length = `${hours}:${minutes.toString().padStart(2, "0")}`;

            return {
                id: contest.id,
                name: contest.name,
                writers: contest.author?.name || "Unknown",
                start,
                length,
                participants: `~${contest.registrations.length}`,
                status: contest.status.toLowerCase(),
            };
        });

        res.json(formatted);
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