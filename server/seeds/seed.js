import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Challenge from '../models/Challenge.js';
import { sampleChallenges } from './challenges.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/justcoding');
  await Challenge.deleteMany({});
  await Challenge.insertMany(sampleChallenges);
  console.log('Sample challenges seeded!');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
