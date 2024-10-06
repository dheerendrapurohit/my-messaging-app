const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Sign-up Route
router.post('/signup', async (req, res) => {
    const { username, email, password, bio, profilePic } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                bio,
                profilePic,
            },
        });
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(400).json({ error: 'User already exists or invalid data' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
});

// Middleware to verify JWT Token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Get User Profile Route
router.get('/profile', authenticateToken, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

// Update User Profile Route
router.put('/profile', authenticateToken, async (req, res) => {
    const { bio, profilePic } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { bio, profilePic },
        });
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(400).json({ error: 'Error updating profile' });
    }
});

module.exports = router;
