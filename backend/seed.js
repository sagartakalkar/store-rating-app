import dotenv from 'dotenv';
import { getPool, seedDatabase } from './src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const runSeed = async () => {
  console.log('--- Seeding Database for StoreRate ---');
  try {
    const pool = await getPool();

    // Reapply schema
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('✓ Schema applied');
    }

    // Clean existing records if any
    await pool.query('DELETE FROM ratings');
    await pool.query('DELETE FROM stores');
    await pool.query('DELETE FROM users');
    console.log('✓ Existing records cleared');

    // Run seed
    await seedDatabase(pool);
    console.log('✓ Demo users, stores, and ratings seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('--------------------------------------------------');
    console.log('ADMIN:       admin@example.com       | Admin@123');
    console.log('USER:        user@example.com        | User@123');
    console.log('OWNER:       owner@example.com       | Owner@123');
    console.log('USER 2:      user2@example.com       | User2@123');
    console.log('OWNER 2:     owner2@example.com      | Owner2@123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

runSeed();
