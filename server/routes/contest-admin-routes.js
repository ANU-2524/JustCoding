// Add these routes to challenges.js after existing contest routes

// Create new contest (Admin only)
router.post('/contests', async (req, res) => {
  try {
    const { title, slug, description, startTime, endTime, duration, maxParticipants, challenges } = req.body;

    if (!title || !slug || !description || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if slug already exists
    const existing = await Contest.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Contest slug already exists' });
    }

    const contest = new Contest({
      title,
      slug,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: duration || 120,
      maxParticipants: maxParticipants || 100,
      challenges: challenges || [],
      status: 'upcoming'
    });

    await contest.save();
    res.json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update contest (Admin only)
router.put('/contests/:slug', async (req, res) => {
  try {
    if (!validateSlug(req.params.slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

    const contest = await Contest.findOne({ slug: req.params.slug });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const { title, description, startTime, endTime, duration, maxParticipants, challenges } = req.body;

    if (title) contest.title = title;
    if (description) contest.description = description;
    if (startTime) contest.startTime = new Date(startTime);
    if (endTime) contest.endTime = new Date(endTime);
    if (duration) contest.duration = duration;
    if (maxParticipants) contest.maxParticipants = maxParticipants;
    if (challenges) contest.challenges = challenges;

    contest.updateStatus();
    await contest.save();

    res.json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contest (Admin only)
router.delete('/contests/:slug', async (req, res) => {
  try {
    if (!validateSlug(req.params.slug)) {
      return res.status(400).json({ error: 'Invalid slug format' });
    }

    const contest = await Contest.findOneAndDelete({ slug: req.params.slug });
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});