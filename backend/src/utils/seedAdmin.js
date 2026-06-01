// Creates the first admin account so you can log into the admin portal.
// Run with: npm run seed:admin
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

async function seed() {
  await connectDB(process.env.MONGO_URI);

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin with email ${email} already exists. Nothing to do.`);
  } else {
    await User.create({
      username: process.env.SEED_ADMIN_USERNAME || 'admin',
      email,
      phone: process.env.SEED_ADMIN_PHONE || '0000000000',
      password: process.env.SEED_ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      status: 'approved',
      isActive: true,
    });
    console.log(`Admin created: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
