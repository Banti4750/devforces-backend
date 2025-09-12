import { Router } from "express";
import { prisma } from "../../config/db.js";
const router = Router();


//get all contests
router.get("/", async (req, res) => {
    try {
        //latest contests first
        const contests = await prisma.contest.findMany({})
        res.status(200).json(contests);
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({ message: "Server error" });
    }
});


//get a single contest by id
router.get("/:id", async (req, res) => {
    try {
        const contest = await prisma.contest.findUnique({
            where: { id: req.params.id },
        });
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        res.status(200).json(contest);
    }
    catch (error) {
        console.error("Error fetching contest:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;