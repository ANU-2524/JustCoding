const express = require('express');
const crypto = require('crypto');
const Room = require('../models/Room');

const router = express.Router();

/**
 * generates a unqiue 6 character room ID
 * @returns roomId
 */
async function generateUniqueRoomId() {
    let roomId = crypto.randomBytes(3).toString('hex');
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 20;

    try {
        while (!isUnique && attempts < maxAttempts) {
            const existingRoom = await Room.findOne({ roomId });
            if (!existingRoom) {
                isUnique = true;
            } else {
                roomId = crypto.randomBytes(3).toString('hex');
                attempts++;
            }
        }

        if (!isUnique) {
            // Fallback to a longer ID if collisions are high (unlikely for 6 chars at this scale)
            roomId = crypto.randomBytes(6).toString('hex');
        }

        return roomId;
    } catch (error) {
        console.error('Error generating room id:', error);
        return null;
    }
}

// Route to create a unique room ID
router.post('/create-room', async (req, res) => {
    try {
        const roomId = await generateUniqueRoomId();
        if (!roomId) {
            return res.status(500).json({ error: 'Failed to generate a unique room ID' });
        }
        res.json({ roomId });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
});

module.exports = router;