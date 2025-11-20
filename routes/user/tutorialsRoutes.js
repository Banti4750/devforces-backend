import express from 'express';
import { verifyToken, authorizeRoles } from "../../middleware/verifyToken.js";
import { prisma } from "../../config/db.js";

const router = express.Router();

// GET /api/tutorials - Get all tutorials with filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            type,
            difficulty,
            technology,
            tag,
            search,
            publishedOnly = true
        } = req.query;

        const skip = (page - 1) * limit;

        // Build filter conditions
        const where = {};

        if (publishedOnly) {
            where.isPublished = true;
        }

        if (type) {
            where.type = type;
        }

        if (difficulty) {
            where.difficulty = difficulty;
        }

        if (technology) {
            where.technologies = {
                has: technology
            };
        }

        if (tag) {
            where.tags = {
                has: tag
            };
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [tutorials, total] = await Promise.all([
            prisma.tutorial.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            profilePic: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.tutorial.count({ where })
        ]);

        res.json({
            success: true,
            data: tutorials,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching tutorials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tutorials'
        });
    }
});

// GET /api/tutorials/:id - Get single tutorial by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const tutorial = await prisma.tutorial.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        profilePic: true,
                        currentRank: true
                    }
                }
            }
        });

        if (!tutorial) {
            return res.status(404).json({
                success: false,
                message: 'Tutorial not found'
            });
        }

        // Increment views
        if (tutorial.isPublished) {
            await prisma.tutorial.update({
                where: { id },
                data: { views: { increment: 1 } }
            });
        }

        res.json({
            success: true,
            data: tutorial
        });

    } catch (error) {
        console.error('Error fetching tutorial:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tutorial'
        });
    }
});

// POST /api/tutorials - Create new tutorial (Admin/Author only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const {
            title,
            description,
            content,
            type,
            difficulty,
            youtubeUrl,
            technologies,
            tags,
            relatedProblemIds,
            duration,
            isPublished = false,
            isFeatured = false
        } = req.body;

        // Validate required fields
        if (!title || !description || !content || !difficulty) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, content, and difficulty are required'
            });
        }

        const tutorial = await prisma.tutorial.create({
            data: {
                title,
                description,
                content,
                type: type || 'WRITTEN',
                difficulty,
                youtubeUrl,
                technologies: technologies || [],
                tags: tags || [],
                relatedProblemIds: relatedProblemIds || [],
                duration,
                isPublished,
                isFeatured,
                authorId: req.user.id
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        profilePic: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Tutorial created successfully',
            data: tutorial
        });

    } catch (error) {
        console.error('Error creating tutorial:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create tutorial'
        });
    }
});

// PUT /api/tutorials/:id - Update tutorial (Admin/Author only)
router.put('/:id', verifyToken, authorizeRoles(['ADMIN', 'MODERATOR']), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            content,
            type,
            difficulty,
            youtubeUrl,
            technologies,
            tags,
            relatedProblemIds,
            duration,
            isPublished,
            isFeatured
        } = req.body;

        // Check if tutorial exists and user is author or admin
        const existingTutorial = await prisma.tutorial.findUnique({
            where: { id }
        });

        if (!existingTutorial) {
            return res.status(404).json({
                success: false,
                message: 'Tutorial not found'
            });
        }

        // Check if user is author or admin
        if (existingTutorial.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this tutorial'
            });
        }

        const tutorial = await prisma.tutorial.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(content && { content }),
                ...(type && { type }),
                ...(difficulty && { difficulty }),
                ...(youtubeUrl !== undefined && { youtubeUrl }),
                ...(technologies && { technologies }),
                ...(tags && { tags }),
                ...(relatedProblemIds && { relatedProblemIds }),
                ...(duration !== undefined && { duration }),
                ...(isPublished !== undefined && { isPublished }),
                ...(isFeatured !== undefined && { isFeatured })
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        profilePic: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: 'Tutorial updated successfully',
            data: tutorial
        });

    } catch (error) {
        console.error('Error updating tutorial:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update tutorial'
        });
    }
});

// DELETE /api/tutorials/:id - Delete tutorial (Admin/Author only)
router.delete('/:id', verifyToken, authorizeRoles(['ADMIN', 'MODERATOR']), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if tutorial exists and user is author or admin
        const existingTutorial = await prisma.tutorial.findUnique({
            where: { id }
        });

        if (!existingTutorial) {
            return res.status(404).json({
                success: false,
                message: 'Tutorial not found'
            });
        }

        // Check if user is author or admin
        if (existingTutorial.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this tutorial'
            });
        }

        await prisma.tutorial.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Tutorial deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting tutorial:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete tutorial'
        });
    }
});

// GET /api/tutorials/author/my-tutorials - Get current user's tutorials
router.get('/author/my-tutorials', verifyToken, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [tutorials, total] = await Promise.all([
            prisma.tutorial.findMany({
                where: {
                    authorId: req.user.id
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: parseInt(limit)
            }),
            prisma.tutorial.count({
                where: {
                    authorId: req.user.id
                }
            })
        ]);

        res.json({
            success: true,
            data: tutorials,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching user tutorials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user tutorials'
        });
    }
});

// PATCH /api/tutorials/:id/publish - Publish/Unpublish tutorial
router.patch('/:id/publish', verifyToken, authorizeRoles(['ADMIN', 'MODERATOR']), async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublished } = req.body;

        // Check if tutorial exists and user is author or admin
        const existingTutorial = await prisma.tutorial.findUnique({
            where: { id }
        });

        if (!existingTutorial) {
            return res.status(404).json({
                success: false,
                message: 'Tutorial not found'
            });
        }

        // Check if user is author or admin
        if (existingTutorial.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this tutorial'
            });
        }

        const tutorial = await prisma.tutorial.update({
            where: { id },
            data: { isPublished },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        profilePic: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: `Tutorial ${isPublished ? 'published' : 'unpublished'} successfully`,
            data: tutorial
        });

    } catch (error) {
        console.error('Error updating tutorial publish status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update tutorial publish status'
        });
    }
});

export default router;