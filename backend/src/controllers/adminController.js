import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const usersCountRes = await query('SELECT COUNT(*)::int AS count FROM users');
    const storesCountRes = await query('SELECT COUNT(*)::int AS count FROM stores');
    const ratingsCountRes = await query('SELECT COUNT(*)::int AS count FROM ratings');

    // Role breakdown
    const roleStatsRes = await query(`
      SELECT role, COUNT(*)::int AS count
      FROM users
      GROUP BY role
    `);

    // Top rated stores
    const topStoresRes = await query(`
      SELECT s.id, s.name, s.address,
             COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
             COUNT(r.id)::int AS rating_count
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name, s.address
      ORDER BY average_rating DESC, rating_count DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: {
        totalUsers: usersCountRes.rows[0].count,
        totalStores: storesCountRes.rows[0].count,
        totalRatings: ratingsCountRes.rows[0].count,
        rolesBreakdown: roleStatsRes.rows,
        topStores: topStoresRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const {
      name,
      email,
      address,
      role,
      sortBy = 'created_at',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const allowedSortCols = ['id', 'name', 'email', 'address', 'role', 'created_at'];
    const safeSortBy = allowedSortCols.includes(sortBy) ? `u.${sortBy}` : 'u.created_at';
    const safeOrder = order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions = [];
    const values = [];

    if (name && name.trim()) {
      values.push(`%${name.trim()}%`);
      conditions.push(`u.name ILIKE $${values.length}`);
    }

    if (email && email.trim()) {
      values.push(`%${email.trim()}%`);
      conditions.push(`u.email ILIKE $${values.length}`);
    }

    if (address && address.trim()) {
      values.push(`%${address.trim()}%`);
      conditions.push(`u.address ILIKE $${values.length}`);
    }

    if (role && role.trim() && role !== 'ALL') {
      values.push(role.trim().toUpperCase());
      conditions.push(`u.role = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching
    const countSql = `SELECT COUNT(*)::int AS total FROM users u ${whereClause}`;
    const countRes = await query(countSql, values);
    const totalCount = countRes.rows[0].total;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Fetch users with store owner average rating calculation
    // "If the user is a STORE OWNER, also display the average rating of their store."
    const sql = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             s.id AS store_id,
             s.name AS store_name,
             CASE
               WHEN u.role = 'OWNER' THEN (
                 SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)
                 FROM stores st
                 LEFT JOIN ratings r ON st.id = r.store_id
                 WHERE st.owner_id = u.id
               )
               ELSE NULL
             END AS owner_store_rating,
             CASE
               WHEN u.role = 'OWNER' THEN (
                 SELECT COUNT(r.id)::int
                 FROM stores st
                 LEFT JOIN ratings r ON st.id = r.store_id
                 WHERE st.owner_id = u.id
               )
               ELSE NULL
             END AS owner_store_rating_count
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeOrder}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const result = await query(sql, [...values, limitNum, offset]);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: result.rows,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [name, email, hashedPassword, address || null, role]
    );

    res.status(201).json({
      success: true,
      message: `User created successfully with role ${role}`,
      data: {
        user: result.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at, u.updated_at
       FROM users u
       WHERE u.id = $1`,
      [id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userRes.rows[0];

    // If owner, fetch their stores and average ratings
    let ownedStores = [];
    if (user.role === 'OWNER') {
      const storesRes = await query(
        `SELECT s.id, s.name, s.email, s.address,
                COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
                COUNT(r.id)::int AS rating_count
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.owner_id = $1
         GROUP BY s.id`,
        [id]
      );
      ownedStores = storesRes.rows;
    }

    // Fetch user's submitted ratings
    const ratingsRes = await query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              s.id AS store_id, s.name AS store_name, s.address AS store_address
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      message: 'User details retrieved',
      data: {
        user,
        ownedStores,
        submittedRatings: ratingsRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getStores = async (req, res, next) => {
  try {
    const {
      name,
      email,
      address,
      sortBy = 'created_at',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const allowedSortCols = {
      id: 's.id',
      name: 's.name',
      email: 's.email',
      address: 's.address',
      created_at: 's.created_at',
      average_rating: 'average_rating'
    };

    const safeSortCol = allowedSortCols[sortBy] || 's.created_at';
    const safeOrder = order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions = [];
    const values = [];

    if (name && name.trim()) {
      values.push(`%${name.trim()}%`);
      conditions.push(`s.name ILIKE $${values.length}`);
    }

    if (email && email.trim()) {
      values.push(`%${email.trim()}%`);
      conditions.push(`s.email ILIKE $${values.length}`);
    }

    if (address && address.trim()) {
      values.push(`%${address.trim()}%`);
      conditions.push(`s.address ILIKE $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*)::int AS total FROM stores s ${whereClause}`;
    const countRes = await query(countSql, values);
    const totalCount = countRes.rows[0].total;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const sql = `
      SELECT s.id, s.name, s.email, s.address, s.created_at, s.owner_id,
             u.name AS owner_name, u.email AS owner_email,
             COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
             COUNT(r.id)::int AS rating_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id, s.name, s.email, s.address, s.created_at, s.owner_id, u.id, u.name, u.email
      ORDER BY ${safeSortCol} ${safeOrder}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const result = await query(sql, [...values, limitNum, offset]);

    res.json({
      success: true,
      message: 'Stores retrieved successfully',
      data: {
        stores: result.rows,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // If owner_id provided, verify they are a valid user with role OWNER
    if (owner_id) {
      const ownerCheck = await query('SELECT id, role FROM users WHERE id = $1', [owner_id]);
      if (ownerCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Specified store owner user does not exist'
        });
      }
      if (ownerCheck.rows[0].role !== 'OWNER') {
        // Upgrade role to OWNER if needed, or return error
        await query("UPDATE users SET role = 'OWNER' WHERE id = $1", [owner_id]);
      }
    }

    const result = await query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at`,
      [name, email, address, owner_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: {
        store: result.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
};
