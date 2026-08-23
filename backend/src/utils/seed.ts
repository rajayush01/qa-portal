/**
 * One-time seed script.
 * Usage: npm run seed
 */
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Category } from '../models/Category';
import mongoose from 'mongoose';

const DEFAULT_DEPARTMENTS = ['HR', 'Finance', 'IT', 'Operations', 'Sales', 'Marketing', 'Engineering', 'Other'];
const DEFAULT_CATEGORIES = [
  'General',
  'Technical',
  'HR',
  'Finance',
  'Policy',
  'Operations',
  'Career',
  'Benefits',
  'Other',
];

const run = async () => {
  await connectDB();

  const adminEmail = 'admin@qaportal.test';
  const userEmail = 'user@qaportal.test';
  const defaultPassword = 'ChangeMe123!';

  const passwordHash = await bcrypt.hash(defaultPassword, 12);

  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      name: 'Portal Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      department: 'IT',
      location: 'HQ',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: userEmail },
    {
      name: 'Demo Employee',
      email: userEmail,
      passwordHash,
      role: 'user',
      department: 'Engineering',
      location: 'Mumbai',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  for (const name of DEFAULT_DEPARTMENTS) {
    await Category.findOneAndUpdate(
      { name, kind: 'department' },
      { name, kind: 'department', isActive: true },
      { upsert: true }
    );
  }

  for (const name of DEFAULT_CATEGORIES) {
    await Category.findOneAndUpdate(
      { name, kind: 'category' },
      { name, kind: 'category', isActive: true },
      { upsert: true }
    );
  }

  console.log('--------------------------------------------------');
  console.log('Seed complete.');
  console.log(`Admin login:  ${adminEmail} / ${defaultPassword}`);
  console.log(`User login:   ${userEmail} / ${defaultPassword}`);
  console.log('--------------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
