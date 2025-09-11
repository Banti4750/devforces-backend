import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../config/db.js";
import { createUserSchema } from "../../validations/user.validation.js";
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

        res.status(201).json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/login', (req, res) => {
    // Login logic here
    res.send('User logged in');
});

router.post('/logout', (req, res) => {
    // Logout logic here
    res.send('User logged out');
});



export default router;