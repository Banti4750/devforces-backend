import express from 'express';
import dotenv from 'dotenv';
import { prisma } from './config/db.js';

import authRoutes from './routes/user/authRoutes.js';
import adminAuthRoutes from './routes/admin/authRuotes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

//user routes
app.use('/api/auth', authRoutes);


//admin routes
app.use('/api/admin/auth', adminAuthRoutes);

//test route
app.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error("Prisma error:", error);
        res.status(500).json({ error: error.message });
    }
});


app.get("/test", (req, res) => {
    res.send("Devforces Backend is Live ✅");
});


app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});