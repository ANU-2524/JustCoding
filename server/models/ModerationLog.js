import mongoose from 'mongoose';
const { Schema } = mongoose;

const ModerationLogSchema = new Schema({
  action: { type: String, required: true }, // e.g., 'delete', 'lock', 'pin', 'warn', 'ban'
  targetType: { type: String, required: true }, // 'Thread' or 'Post'
  targetId: { type: Schema.Types.ObjectId, required: true },
  moderator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('ModerationLog', ModerationLogSchema);
