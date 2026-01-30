import mongoose from 'mongoose';
const { Schema } = mongoose;

const ThreadSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  locked: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false },
  tags: [String],
  postCount: { type: Number, default: 0 },
  lastPost: { type: Schema.Types.ObjectId, ref: 'Post' },
});

export default mongoose.model('Thread', ThreadSchema);
