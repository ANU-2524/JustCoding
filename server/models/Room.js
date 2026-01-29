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
    },
    executionState: {
        isExecuting: {
            type: Boolean,
            default: false
        },
        currentExecutionId: String,
        lastExecutionAt: Date,
        executionCount: {
            type: Number,
            default: 0
        }
    },
    messageSequence: {
        type: Number,
        default: 0
    }
});

roomSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

// Method to start execution
roomSchema.methods.startExecution = function(executionId) {
    this.executionState.isExecuting = true;
    this.executionState.currentExecutionId = executionId;
    this.executionState.executionCount += 1;
    return this.save();
};

// Method to end execution
roomSchema.methods.endExecution = function() {
    this.executionState.isExecuting = false;
    this.executionState.currentExecutionId = null;
    this.executionState.lastExecutionAt = new Date();
    return this.save();
};

// Method to get next message sequence number
roomSchema.methods.getNextSequence = function() {
    this.messageSequence += 1;
    return this.messageSequence;
};

module.exports = mongoose.model('Room', roomSchema);