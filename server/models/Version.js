import mongoose from 'mongoose';
const { Schema } = mongoose;

const VersionSchema = new Schema({
  document: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Version || mongoose.model('Version', VersionSchema);
