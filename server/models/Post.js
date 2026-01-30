import mongoose from 'mongoose';
const { Schema } = mongoose;

const PostSchema = new Schema({
  thread: { type: Schema.Types.ObjectId, ref: 'Thread', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }, // HTML or markdown
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  parent: { type: Schema.Types.ObjectId, ref: 'Post', default: null }, // For nested replies
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isReply: { type: Boolean, default: false },
  replyCount: { type: Number, default: 0 },
  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  edited: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
