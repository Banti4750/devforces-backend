import express from 'express';
import { verifyAdminToken } from '../../middleware/verifyToken.js';
import { prisma } from "../../config/db.js";

const router = express.Router();

// fallback sample (for empty DB)
const globalLeaders = [
    { rank: 1, username: 'tourist', rating: 3889, country: 'BY', maxRank: 'Legendary Grandmaster', solved: 3245, contests: 156 },
    { rank: 2, username: 'Benq', rating: 3779, country: 'US', maxRank: 'Legendary Grandmaster', solved: 2891, contests: 142 },
    { rank: 3, username: 'ksun48', rating: 3721, country: 'CA', maxRank: 'Legendary Grandmaster', solved: 2654, contests: 138 },
    { rank: 4, username: 'Petr', rating: 3695, country: 'RU', maxRank: 'Legendary Grandmaster', solved: 2987, contests: 165 },
    { rank: 5, username: 'Um_nik', rating: 3684, country: 'RU', maxRank: 'Legendary Grandmaster', solved: 2743, contests: 147 },
    { rank: 6, username: 'jiangly', rating: 3672, country: 'CN', maxRank: 'Legendary Grandmaster', solved: 3012, contests: 134 },
    { rank: 7, username: 'Radewoosh', rating: 3658, country: 'PL', maxRank: 'Legendary Grandmaster', solved: 2834, contests: 152 },
    { rank: 8, username: 'ecnerwala', rating: 3642, country: 'US', maxRank: 'Legendary Grandmaster', solved: 2567, contests: 129 },
];

router.get('/', verifyAdminToken, async (req, res) => {
    const { start = 0, end = 10 } = req.query;

    try {
        const leaders = await prisma.leaderboard.findMany({
            orderBy: { rank: 'asc' },
            skip: Number(start),
            take: Number(end) - Number(start),
            include: {
                user: {
                    select: {
                        name: true,
                        country: true,
                        maxRank: true,
                    }
                }
            }
        });

        if (!leaders.length) {
            return res.status(200).json(globalLeaders);
        }

        const formatted = leaders.map(l => ({
            rank: l.rank,
            username: l.user.username,
            rating: l.rating,
            country: l.user.country ?? "N/A",
            maxRank: l.user.maxRank ?? "Unrated",
            solved: l.problemsSolved,
            contests: l.contestsParticipated
        }));

        res.status(200).json(formatted);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
