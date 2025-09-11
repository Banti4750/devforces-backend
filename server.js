import express from 'express';
import dotenv from 'dotenv';
import { prisma } from './config/db.js';

import authRoutes from './routes/user/authRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

//user routes
app.use('/api/auth', authRoutes);

app.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});