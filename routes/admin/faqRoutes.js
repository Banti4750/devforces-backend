import express from 'express'
import { prisma } from '../../config/db';
import { verifyAdminToken } from '../../middleware/verifyToken';
const router = express.Router();

//add faq
router.post("/", verifyAdminToken, async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ success: false, message: "Question and answer are required." });
        }
        const newFaq = await prisma.faq.create({
            data: {
                question,
                answer
            }
        });
        res.status(201).json({ success: true, message: "FAQ added successfully.", faq: newFaq });
    }
    catch (error) {
        console.error("Error adding FAQ:", error);
        res.status(500).json({ success: false, message: "Failed to add FAQ.", error: error.message });
    }
});

//delete faq
router.delete("/:id", verifyAdminToken, async (req, res) => {
    try {
        // if ((id)) {
        //     return res.status(400).json({ success: false, message: "Invalid faq ID." });
        // }
        const faq = await prisma.faq.delete({
            where: { id }
        })
        if (!faq) {
            return res.status(404).json({ success: false, message: "FAQ not found." });
        }
        res.status(200).json({ success: true, message: "faq deleted" })
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        res.status(500).json({ success: false, message: "Failed to delete FAQ.", error: error.message });
    }
});

// get all faq
router.get("/", verifyAdminToken, async (req, res) => {
    try {
        const faqs = await prisma.faq.findMany();
        res.status(200).json({ success: true, faqs });
    }
    catch (error) {
        console.error("Error fetching FAQs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch FAQs.",
            error: error.message,
        });
    }
});



export default router;