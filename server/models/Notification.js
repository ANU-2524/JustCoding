import mongoose from 'mongoose';
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'mention', 'reply', 'moderation', 'upvote'
  message: { type: String, required: true },
  link: { type: String }, // URL to thread/post
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Notification', NotificationSchema);
