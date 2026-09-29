import pg from 'pg';
import { newDb } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let poolInstance = null;
let isInitialized = false;

export const getPool = async () => {
  if (poolInstance) {
    return poolInstance;
  }

  // If real PostgreSQL configuration is provided
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    console.log('[DB] Connecting to PostgreSQL database...');
    poolInstance = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    poolInstance.on('error', (err) => {
      console.error('[DB] Unexpected error on idle PostgreSQL client:', err);
    });

    return poolInstance;
  }

  // Fallback to high-fidelity in-memory PostgreSQL instance using pg-mem
  console.log('[DB] Initializing PostgreSQL engine (pg-mem)...');
  const { DataType } = await import('pg-mem');
  const db = newDb();

  // Register ROUND function with precision for PostgreSQL compatibility in pg-mem
  db.public.registerFunction({
    name: 'round',
    args: [DataType.float, DataType.integer],
    returns: DataType.float,
    implementation: (val, prec) =>
      val !== null && val !== undefined ? Number(Number(val).toFixed(prec)) : 0,
  });

  db.public.registerFunction({
    name: 'round',
    args: [DataType.decimal, DataType.integer],
    returns: DataType.float,
    implementation: (val, prec) =>
      val !== null && val !== undefined ? Number(Number(val).toFixed(prec)) : 0,
  });

  // Create standard pg.Pool adapter
  const adapter = db.adapters.createPg();
  poolInstance = new adapter.Pool();

  return poolInstance;
};

export const query = async (text, params) => {
  const pool = await getPool();
  return pool.query(text, params);
};

export const initDb = async () => {
  if (isInitialized) return;
  const pool = await getPool();

  try {
    // Read schema.sql
    const schemaPath = path.resolve(__dirname, '../../schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('[DB] Schema applied successfully.');
    }

    // Check if demo seed data already exists
    const usersCheck = await pool.query('SELECT COUNT(*)::int as count FROM users');
    if (parseInt(usersCheck.rows[0].count, 10) === 0) {
      console.log('[DB] Empty database detected. Seeding initial demo data...');
      await seedDatabase(pool);
      console.log('[DB] Initial demo data seeded successfully.');
    }

    isInitialized = true;
  } catch (err) {
    console.error('[DB] Error during database initialization:', err);
    throw err;
  }
};

export const seedDatabase = async (pool) => {
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const userHash = await bcrypt.hash('User@123', 10);
  const ownerHash = await bcrypt.hash('Owner@123', 10);
  const owner2Hash = await bcrypt.hash('Owner2@123', 10);
  const user2Hash = await bcrypt.hash('User2@123', 10);

  // Note: Names must be 20 to 60 characters to satisfy validation rules
  // Admin: Alexander Michael Davis (23 chars)
  // Owner 1: Sarah Jessica Montgomery (24 chars)
  // Owner 2: Christopher Daniel Hayes (24 chars)
  // User 1: Robert Jonathan Sterling (24 chars)
  // User 2: Eleanor Beatrice Vance (22 chars)

  await pool.query(`
    INSERT INTO users (name, email, password, address, role) VALUES
    ($1, $2, $3, $4, $5),
    ($6, $7, $8, $9, $10),
    ($11, $12, $13, $14, $15),
    ($16, $17, $18, $19, $20),
    ($21, $22, $23, $24, $25)
  `, [
    'Alexander Michael Davis', 'admin@example.com', adminHash, '100 Corporate Executive Plaza, Suite 400, New York, NY 10001', 'ADMIN',
    'Sarah Jessica Montgomery', 'owner@example.com', ownerHash, '742 Evergreen Artisan Way, Springfield, IL 62704', 'OWNER',
    'Christopher Daniel Hayes', 'owner2@example.com', owner2Hash, '500 Tech Boulevard, Innovation Center, Austin, TX 78701', 'OWNER',
    'Robert Jonathan Sterling', 'user@example.com', userHash, '124 Conch Residential Way, Pacific Palisades, CA 90272', 'USER',
    'Eleanor Beatrice Vance', 'user2@example.com', user2Hash, '88 Beacon Hill Promenade, Boston, MA 02108', 'USER'
  ]);

  // Retrieve user IDs
  const ownerRes = await pool.query("SELECT id FROM users WHERE email = 'owner@example.com'");
  const owner2Res = await pool.query("SELECT id FROM users WHERE email = 'owner2@example.com'");
  const user1Res = await pool.query("SELECT id FROM users WHERE email = 'user@example.com'");
  const user2Res = await pool.query("SELECT id FROM users WHERE email = 'user2@example.com'");

  const owner1Id = ownerRes.rows[0].id;
  const owner2Id = owner2Res.rows[0].id;
  const user1Id = user1Res.rows[0].id;
  const user2Id = user2Res.rows[0].id;

  // Insert Stores
  await pool.query(`
    INSERT INTO stores (name, email, address, owner_id) VALUES
    ($1, $2, $3, $4),
    ($5, $6, $7, $8),
    ($9, $10, $11, $12),
    ($13, $14, $15, $16)
  `, [
    'Apex Tech & Electronics Hub', 'contact@apextech.example.com', '450 Silicon Parkway, Building 3, San Jose, CA 95112', owner1Id,
    'Metro Gourmet Organic Grocers', 'support@metrogourmet.example.com', '820 Market Street, Market Plaza, Seattle, WA 98101', owner1Id,
    'Urban Artisan Coffee & Bakery', 'hello@urbanartisan.example.com', '125 Central Commerce Avenue, Chicago, IL 60601', owner2Id,
    'Lakeside Sporting Goods Depot', 'orders@lakesidesports.example.com', '930 Waterfront Promenade, Denver, CO 80202', null
  ]);

  // Retrieve store IDs
  const storesRes = await pool.query("SELECT id, name FROM stores ORDER BY id ASC");
  const store1Id = storesRes.rows[0].id;
  const store2Id = storesRes.rows[1].id;
  const store3Id = storesRes.rows[2].id;

  // Insert Ratings (user1 and user2)
  await pool.query(`
    INSERT INTO ratings (user_id, store_id, rating) VALUES
    ($1, $2, $3),
    ($4, $5, $6),
    ($7, $8, $9),
    ($10, $11, $12)
  `, [
    user1Id, store1Id, 5,
    user2Id, store1Id, 4,
    user1Id, store2Id, 5,
    user2Id, store3Id, 4
  ]);
};

export default {
  getPool,
  query,
  initDb,
  seedDatabase
};
