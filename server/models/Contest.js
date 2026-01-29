import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // minutes
  isPublic: { type: Boolean, default: true },
  maxParticipants: { type: Number, default: 1000 },
  participants: [{
    odId: String,
    odName: String,
    joinedAt: { type: Date, default: Date.now },
    totalPoints: { type: Number, default: 0 },
    solvedCount: { type: Number, default: 0 },
    lastSubmission: Date
  }],
  leaderboard: [{
    rank: Number,
    odId: String,
    odName: String,
    totalPoints: Number,
    solvedCount: Number,
    totalTime: Number // penalty time in minutes
  }],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'ended'],
    default: 'upcoming'
  },
  createdAt: { type: Date, default: Date.now }
});

// Update status based on time
contestSchema.methods.updateStatus = function() {
  const now = new Date();
  if (now < this.startTime) {
    this.status = 'upcoming';
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = 'active';
  } else {
    this.status = 'ended';
  }
  return this.status;
};

export default mongoose.model('Contest', contestSchema);
