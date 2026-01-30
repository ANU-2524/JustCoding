import express from 'express';
import Document from '../models/Document.js';
import Version from '../models/Version.js';
import CollaborationSession from '../models/CollaborationSession.js';

const router = express.Router();

// Create a new document
router.post('/documents', async (req, res) => {
  try {
    const doc = new Document({
      title: req.body.title,
      content: req.body.content || '',
      owner: req.body.owner,
      collaborators: req.body.collaborators || [],
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all documents for a user
router.get('/documents', async (req, res) => {
  try {
    const docs = await Document.find({ $or: [ { owner: req.query.userId }, { collaborators: req.query.userId } ] });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a document by ID
router.get('/documents/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a new version
router.post('/documents/:id/version', async (req, res) => {
  try {
    const version = new Version({
      document: req.params.id,
      content: req.body.content,
      createdBy: req.body.userId,
    });
    await version.save();
    await Document.findByIdAndUpdate(req.params.id, { $push: { versions: version._id }, updatedAt: new Date() });
    res.status(201).json(version);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
