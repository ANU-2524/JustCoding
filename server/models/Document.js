import mongoose from 'mongoose';
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  versions: [{ type: Schema.Types.ObjectId, ref: 'Version' }],
});

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
