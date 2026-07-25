const mongoose = require('mongoose');
const logger = require('../utils/logger');
const User = require('../modules/user/user.model');

async function seedSuperAdmin() {
  const existing = await User.findOne({ role: 'superAdmin' });
  if (existing) {
    logger.info('superAdmin already present, skipping seed');
    return;
  }

  await User.create({
    name: 'Super Admin',
    email: "superadmin@gmail.com",
    password: "12345",
    role: 'superAdmin',
  });

  logger.info(`Seeded superAdmin (${process.env.SUPERADMIN_EMAIL}) — change the password after first login`);
}


async function connectDB() {
  mongoose.connection.on('connected', async () => {
    logger.info('MongoDB connected');
    try {
      await seedSuperAdmin();
    } catch (err) {
      logger.error({ err }, 'superAdmin seed failed');
    }
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  await mongoose.connect(process.env.MONGODB_URI);
}

module.exports = connectDB;
