import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/db.js";
import {
    createAdminSchema,
    loginAdminSchema,
} from "../../validations/admin.validation.js";

const router = Router();

// ==================== LOGIN ====================
router.post("/login", async (req, res) => {
    try {
        const parsed = loginAdminSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        const data = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user || user.role !== "ADMIN") {
            return res.status(400).json({ message: "Invalid email, password, or role" });
        }

        const validPassword = await bcrypt.compare(data.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET_ADMIN,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, email: user.email, role: user.role, name: user.name },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ==================== REGISTER ====================
// router.post("/register", async (req, res) => {
//     try {
//         const parsed = createAdminSchema.safeParse(req.body);
//         if (!parsed.success) {
//             return res.status(400).json({
//                 message: "Validation failed",
//                 errors: parsed.error.flatten().fieldErrors,
//             });
//         }

//         const data = parsed.data;

//         const existingUser = await prisma.user.findUnique({
//             where: { email: data.email },
//         });

//         if (existingUser) {
//             return res.status(400).json({ message: "Email already in use" });
//         }

//         const hashedPassword = await bcrypt.hash(data.password, 12);

//         const user = await prisma.user.create({
//             data: {
//                 ...data,
//                 password: hashedPassword,
//                 role: "ADMIN", // enforce ADMIN role on register
//             },
//         });

//         res.status(201).json({
//             message: "Admin registered successfully",
//             user: { id: user.id, email: user.email, role: user.role },
//         });
//     } catch (error) {
//         console.error("Register error:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

export default router;
