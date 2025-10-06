
import express from "express";
const router = express.Router();
import { prisma } from "../../config/db.js";
import { verifyToken } from "../../middleware/verifyToken.js";

//post faq
router.get("/", verifyToken, async (req, res) => {
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