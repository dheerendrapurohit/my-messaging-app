const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();
const authenticateToken = require('./authRoutes').authenticateToken; // Middleware to verify JWT

// Send a message
router.post('/message', authenticateToken, async (req, res) => {
    const { content, receiverId } = req.body;

    try {
        const message = await prisma.message.create({
            data: {
                content,
                senderId: req.user.id,
                receiverId,
            },
        });
        res.status(201).json({ message: 'Message sent successfully', message });
    } catch (error) {
        res.status(400).json({ error: 'Failed to send message' });
    }
});

// Get all messages for a user
router.get('/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.user.id },
                    { receiverId: req.user.id },
                ],
            },
            include: {
                sender: { select: { username: true } },
                receiver: { select: { username: true } },
            },
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

// Get specific conversation between two users
router.get('/messages/:receiverId', authenticateToken, async (req, res) => {
    const receiverId = parseInt(req.params.receiverId);
    
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.user.id, receiverId },
                    { senderId: receiverId, receiverId: req.user.id },
                ],
            },
            include: {
                sender: { select: { username: true } },
                receiver: { select: { username: true } },
            },
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching conversation' });
    }
});

module.exports = router;
