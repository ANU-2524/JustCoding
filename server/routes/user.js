import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import Snippet from '../models/Snippet.js';

// ============ PROFILE ENDPOINTS ============

// Get user profile
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        let user = await User.findOne({ userId });

        if (!user) {
            // Create new user if not exists
            user = await User.create({ userId });
        }

        res.json({
            userId: user.userId,
            displayName: user.displayName,
            email: user.email,
            bio: user.bio,
            photoURL: user.photoURL,
            githubUrl: user.githubUrl,
            linkedinUrl: user.linkedinUrl,
            preferences: user.preferences,
            totalPoints: user.totalPoints,
            level: user.level,
            badges: user.badges,
            createdAt: user.createdAt,
            lastActiveAt: user.lastActiveAt
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { displayName, bio, photoURL, githubUrl, linkedinUrl, preferences } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const updateData = { lastActiveAt: new Date() };

        if (displayName !== undefined) updateData.displayName = String(displayName).slice(0, 100);
        if (bio !== undefined) updateData.bio = String(bio).slice(0, 500);
        if (photoURL !== undefined) updateData.photoURL = String(photoURL).slice(0, 2000);
        if (githubUrl !== undefined) updateData.githubUrl = String(githubUrl).slice(0, 200);
        if (linkedinUrl !== undefined) updateData.linkedinUrl = String(linkedinUrl).slice(0, 200);
        if (preferences !== undefined) updateData.preferences = preferences;

        const user = await User.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.json({
            userId: user.userId,
            displayName: user.displayName,
            bio: user.bio,
            photoURL: user.photoURL,
            githubUrl: user.githubUrl,
            linkedinUrl: user.linkedinUrl,
            preferences: user.preferences
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ============ SNIPPETS ENDPOINTS ============

// Get all snippets for a user
router.get('/snippets/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const snippets = await Snippet.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(100);

        res.json(snippets);
    } catch (error) {
        console.error('Get snippets error:', error);
        res.status(500).json({ error: 'Failed to get snippets' });
    }
});

// Create a new snippet
router.post('/snippets', async (req, res) => {
    try {
        const { userId, title, language, code } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const snippet = await Snippet.create({
            userId,
            title: String(title || 'Untitled').slice(0, 120),
            language: language || 'javascript',
            code: code || ''
        });

        res.status(201).json(snippet);
    } catch (error) {
        console.error('Create snippet error:', error);
        res.status(500).json({ error: 'Failed to create snippet' });
    }
});

// Update a snippet
router.put('/snippets/:snippetId', async (req, res) => {
    try {
        const { snippetId } = req.params;
        const { userId, title, language, code } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const updateData = { updatedAt: new Date() };
        if (title !== undefined) updateData.title = String(title).slice(0, 120);
        if (language !== undefined) updateData.language = language;
        if (code !== undefined) updateData.code = code;

        const snippet = await Snippet.findOneAndUpdate(
            { _id: snippetId, userId },
            { $set: updateData },
            { new: true }
        );

        if (!snippet) {
            return res.status(404).json({ error: 'Snippet not found' });
        }

        res.json(snippet);
    } catch (error) {
        console.error('Update snippet error:', error);
        res.status(500).json({ error: 'Failed to update snippet' });
    }
});

// Delete a snippet
router.delete('/snippets/:snippetId', async (req, res) => {
    try {
        const { snippetId } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const result = await Snippet.findOneAndDelete({ _id: snippetId, userId });

        if (!result) {
            return res.status(404).json({ error: 'Snippet not found' });
        }

        res.json({ deleted: true, snippetId });
    } catch (error) {
        console.error('Delete snippet error:', error);
        res.status(500).json({ error: 'Failed to delete snippet' });
    }
});

// Bulk sync snippets (for initial sync from localStorage)
router.post('/snippets/sync', async (req, res) => {
    try {
        const { userId, snippets } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        if (!Array.isArray(snippets)) {
            return res.status(400).json({ error: 'snippets must be an array' });
        }

        const results = [];

        for (const snippet of snippets.slice(0, 100)) {
            const existingSnippet = await Snippet.findOne({
                userId,
                title: snippet.title,
                language: snippet.language
            });

            if (!existingSnippet) {
                const newSnippet = await Snippet.create({
                    userId,
                    title: String(snippet.title || 'Untitled').slice(0, 120),
                    language: snippet.language || 'javascript',
                    code: snippet.code || '',
                    createdAt: snippet.createdAt ? new Date(snippet.createdAt) : new Date(),
                    updatedAt: snippet.updatedAt ? new Date(snippet.updatedAt) : new Date()
                });
                results.push(newSnippet);
            }
        }

        res.json({
            synced: results.length,
            snippets: results
        });
    } catch (error) {
        console.error('Sync snippets error:', error);
        res.status(500).json({ error: 'Failed to sync snippets' });
    }
});

export default router;
