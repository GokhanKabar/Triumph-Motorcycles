import { Sequelize } from 'sequelize';
import UserModel from '../models/UserModel';
import { UserSeed } from '../seeds/userSeed';

export async function seedDatabase(sequelize?: Sequelize, force: boolean = false): Promise<void> {
  try {
    console.log('🌱 Starting database seeding process...');

    if (!sequelize) {
      throw new Error('No Sequelize instance provided');
    }

    const userCount = await UserModel.count();
    
    if (userCount === 0 || force) {
      console.log(force ? '🔄 Force seeding database...' : '📊 No users found. Initiating seed process...');
      await UserSeed.seed(force);
      console.log('✅ Database seeded successfully.');
    } else {
      console.log(`📊 Database already contains ${userCount} users. Skipping seed.`);
    }
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}