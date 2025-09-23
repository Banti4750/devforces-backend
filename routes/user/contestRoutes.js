import { Router } from "express";
import { prisma } from "../../config/db.js";
import moment from "moment";
import { verifyToken } from "../../middleware/verifyToken.js";
const router = Router();


//get all contests
router.get("/", verifyToken, async (req, res) => {
    try {
        const contests = await prisma.contest.findMany({
            include: {
                problems: {
                    include: { problem: true },
                },
                registrations: true,
                author: {
                    select: { email: true, name: true },
                },
            },
        });

        const formatted = contests.map((contest) => {
            const start = moment(contest.startTime).format("MMM DD, YYYY HH:mm");
            const hours = Math.floor(contest.duration / 60);
            const minutes = contest.duration % 60;
            const length = `${hours}:${minutes.toString().padStart(2, "0")}`;

            const userRegistration = contest.registrations.find(
                (r) => r.userId === req.user.id
            );

            return {
                id: contest.id,
                name: contest.name,
                writers: contest.author?.name || "Unknown",
                start,
                length,
                participants: `~${contest.registrations.length}`,
                status: contest.status?.toLowerCase() || "unknown",
                isRegistered: Boolean(userRegistration),
                registrationId: userRegistration ? userRegistration.id : null,
            };
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({
            message: "Error fetching contests",
            error: err.message,
        });
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
                    },
                },
                registrations: true,
            },
        });

        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }


        const now = new Date();

        if (contest.startTime && contest.startTime.getTime() > now.getTime()) {
            return res.status(403).json({ message: "Contest not started yet" });
        }

        if (contest.endTime && contest.endTime.getTime() < now.getTime()) {
            return res.status(403).json({ message: "Contest already ended" });
        }


        return res.json(contest);
    } catch (err) {
        return res.status(500).json({
            message: "Error fetching contest",
            error: err.message,
        });
    }
});

export default router;