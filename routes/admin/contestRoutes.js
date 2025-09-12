import { Router } from "express";
import { createContestSchema } from "../../validations/contest.validation.js";
import { prisma } from "../../config/db.js";
import { verifyAdminToken } from "../../middleware/verifyToken.js";
const router = Router();

//add a new contest
router.post("/", verifyAdminToken, async (req, res) => {
    try {
        const parsed = createContestSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors,
            });
        }
        const data = parsed.data;
        const newContest = await prisma.contest.create({
            data: {
                name: data.name,
                description: data.description,
                startTime: data.startTime,
                endTime: data.endTime,
                duration: data.duration,
                isPublic: data.isPublic ?? true,
                authorId: req.user.id,
            },
        });

        res.status(201).json(newContest);
    } catch (error) {
        console.error("Error creating contest:", error);
        res.status(500).json({ message: "Server error" });
    }
});


//update a contest by id
router.put("/:id", async (req, res) => {
    try {

        const parsed = createContestSchema.partial().safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors,
            });
        }
        const data = parsed.data;

        if (!req.params.id) {
            return res.status(400).json({ message: "Contest ID is required" });
        }

        //id must be a valid mongoose objectId
        if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
            return res.status(400).json({ message: "Invalid contest ID" });
        }

        const existingContest = await prisma.contest.findUnique({
            where: { id: req.params.id },
        });

        if (!existingContest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        const updatedContest = await prisma.contest.update({
            where: { id: req.params.id },
            data: {
                ...data,
            },
        });
        res.status(200).json(updatedContest);
    } catch (error) {
        console.error("Error updating contest:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//delete a contest by id
router.delete("/:id", async (req, res) => {
    try {
        const deletedContest = await Contest.findByIdAndDelete(req.params.id);
        if (!deletedContest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        res.status(200).json({ message: "Contest deleted successfully" });
    } catch (error) {
        console.error("Error deleting contest:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//get all contests
router.get("/", async (req, res) => {
    try {
        const contests = await prisma.contest.findMany({});
        res.status(200).json(contests);
    }
    catch (error) {
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