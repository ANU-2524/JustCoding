import { Server } from 'socket.io';
import Document from '../models/Document.js';
import Version from '../models/Version.js';

// For demo: naive in-memory doc state (replace with OT/CRDT in production)
const docs = {};

export default function initCollabSocket(io) {
  io.on('connection', (socket) => {
    socket.on('join-document', async ({ docId, userId }) => {
      socket.join(docId);
      if (!docs[docId]) {
        const doc = await Document.findById(docId);
        docs[docId] = doc ? doc.content : '';
      }
      socket.emit('document', docs[docId]);
      socket.to(docId).emit('user-joined', userId);
    });

    socket.on('edit-document', ({ docId, content }) => {
      docs[docId] = content;
      socket.to(docId).emit('document', content);
    });

    socket.on('cursor-update', ({ docId, userId, cursor }) => {
      socket.to(docId).emit('cursor-update', { userId, cursor });
    });

    socket.on('chat-message', ({ docId, user, message }) => {
      io.to(docId).emit('chat-message', { user, message });
    });

    socket.on('save-version', async ({ docId, content, userId }) => {
      const version = new Version({ document: docId, content, createdBy: userId });
      await version.save();
      await Document.findByIdAndUpdate(docId, { $push: { versions: version._id }, updatedAt: new Date() });
      io.to(docId).emit('version-saved', version);
    });
  });
}
