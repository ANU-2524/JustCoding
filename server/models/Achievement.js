import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  badgeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['coding', 'learning', 'social', 'milestone', 'streak'],
    required: true 
  },
  points: { type: Number, default: 10 },
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  criteria: {
    eventType: { type: String },
    count: { type: Number },
    timeframe: { type: String }, // 'daily', 'weekly', 'monthly', 'all-time'
    conditions: { type: mongoose.Schema.Types.Mixed }
  },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model('Achievement', achievementSchema);