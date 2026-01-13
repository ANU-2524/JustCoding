const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    code: {
        type: String,
        default: "",
    },
    language: {
        type: String,
        default: 'javascript',
    },
    participants: {
        type: Array,
        default: [],
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    }
});

roomSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
})

module.exports = mongoose.model('Room', roomSchema);