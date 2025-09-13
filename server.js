import express from 'express';
import dotenv from 'dotenv';
import { prisma } from './config/db.js';
import adminContestRoutes from './routes/admin/contestRoutes.js';
import authRoutes from './routes/user/authRoutes.js';
import adminAuthRoutes from './routes/admin/authRuotes.js';
import userContestRoutes from './routes/user/contestRoutes.js';
import adminTagRoutes from './routes/admin/tagRoutes.js';
import userTagRoutes from './routes/user/tagRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

//user routes
app.use('/api/auth', authRoutes);
app.use('/api/contests', userContestRoutes);
app.use('/api/tags', userTagRoutes);


//admin routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/contests', adminContestRoutes);
app.use('/api/admin/tags', adminTagRoutes);

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