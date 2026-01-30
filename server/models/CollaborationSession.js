import mongoose from 'mongoose';
const { Schema } = mongoose;

const CollaborationSessionSchema = new Schema({
  document: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  active: { type: Boolean, default: true },
});

export default mongoose.models.CollaborationSession || mongoose.model('CollaborationSession', CollaborationSessionSchema);
