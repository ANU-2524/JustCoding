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
    },
    executionState: {
        isExecuting: {
            type: Boolean,
            default: false
        },
        currentExecutionId: String,
        lastExecutionAt: Date,
        lastExecutionSequence: Number,
        executionCount: {
            type: Number,
            default: 0
        }
    },
    messageSequence: {
        type: Number,
        default: 0
    },
    // Ordered message tracking
    messageTracking: {
        nextExpectedSequence: {
            type: Number,
            default: 1
        },
        lastProcessedSequence: {
            type: Number,
            default: 0
        },
        lastCodeChangeSequence: {
            type: Number,
            default: 0
        },
        lastExecutionSequence: {
            type: Number,
            default: 0
        }
    },
    // Causality chain - ensures operations depend on previous state
    causalityChain: {
        lastCodeStateHash: String,
        lastExecutionHash: String,
        codeVersion: {
            type: Number,
            default: 0
        }
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

/**
 * Record a code change and update causality
 */
roomSchema.methods.recordCodeChange = function(code, sequence) {
    if (!this.causalityChain) {
        this.causalityChain = { codeVersion: 0 };
    }
    
    this.code = code;
    this.causalityChain.codeVersion += 1;
    this.causalityChain.lastCodeChangeSequence = sequence;
    
    // Simple hash of code for causality verification
    this.causalityChain.lastCodeStateHash = this._hashCode(code);
    
    if (!this.messageTracking) {
        this.messageTracking = {};
    }
    this.messageTracking.lastCodeChangeSequence = sequence;
    
    return this.save();
};

/**
 * Record execution and link to code version
 */
roomSchema.methods.recordExecution = function(executionId, sequence, codeHash) {
    if (!this.executionState) {
        this.executionState = {};
    }
    
    this.executionState.currentExecutionId = executionId;
    this.executionState.lastExecutionAt = new Date();
    this.executionState.lastExecutionSequence = sequence;
    this.executionState.executionCount = (this.executionState.executionCount || 0) + 1;
    
    if (!this.messageTracking) {
        this.messageTracking = {};
    }
    this.messageTracking.lastExecutionSequence = sequence;
    
    if (!this.causalityChain) {
        this.causalityChain = {};
    }
    this.causalityChain.lastExecutionHash = codeHash;
    
    return this.save();
};

/**
 * Verify message is valid for this room state
 * Returns validation result with any issues found
 */
roomSchema.methods.validateMessageSequence = function(messageType, sequence, dependencies = {}) {
    if (!this.messageTracking) {
        return { valid: true, issues: [] };
    }

    const issues = [];
    const tracking = this.messageTracking;

    // Code must come before execution
    if (messageType === 'code-execute') {
        if (dependencies.codeChangeSequence && tracking.lastCodeChangeSequence) {
            if (dependencies.codeChangeSequence > tracking.lastCodeChangeSequence) {
                issues.push('Execution references code change that has not been processed yet');
            }
        }
    }

    // Execution must come after code
    if (messageType === 'code-change') {
        if (tracking.lastExecutionSequence && sequence < tracking.lastExecutionSequence) {
            // This is actually ok - we can change code after execution
        }
    }

    return {
        valid: issues.length === 0,
        issues,
        executionAllowed: !issues.some(i => i.includes('Execution'))
    };
};

/**
 * Simple hash function for code (for causality verification)
 */
roomSchema.methods._hashCode = function(str) {
    let hash = 0;
    if (!str) return hash;
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
};

/**
 * Get room's causality state for diagnostics
 */
roomSchema.methods.getCausalityState = function() {
    return {
        messageSequence: this.messageSequence,
        messageTracking: this.messageTracking || {},
        causalityChain: this.causalityChain || {},
        codeLength: this.code?.length || 0
    };
};

export default mongoose.model('Room', roomSchema);