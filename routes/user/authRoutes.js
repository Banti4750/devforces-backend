import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../config/db.js";
import { createUserSchema, loginUserSchema } from "../../validations/user.validation.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../middleware/verifyToken.js";
import moment from "moment";

const router = Router();

// Define your auth routes here (e.g., register, login, logout)
router.post('/register', async (req, res) => {
    try {
        const parsed = createUserSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.format(),
            });
        }
        const data = parsed.data;

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Example with Prisma
        const user = await prisma.user.create({
            data: { ...data, password: hashedPassword },
        });

        res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/login', async (req, res) => {

    try {
        const parsed = loginUserSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.format(),
            });
        }
        const data = parsed.data;


        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (!await bcrypt.compare(data.password, user.password)) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        //token creation logic here
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: "Login successful", token });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/profile', verifyToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, maxRank: true, currentRank: true, profilePic: true, isVerified: true, country: true, organization: true, joinedAt: true }
        });
        res.status(200).json({ user, joinedAtFormatted: moment(user.joinedAt).format('DD MMMM YYYY') });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/logout', (req, res) => {
    // Logout logic here
    res.send('User logged out');
});



export default router;