import mongoose from 'mongoose';

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

export default mongoose.model('Room', roomSchema);