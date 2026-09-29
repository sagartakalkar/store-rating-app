import { query } from '../config/db.js';

export const getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Find all stores owned by this owner
    const storesRes = await query(
      `SELECT s.id, s.name, s.email, s.address, s.created_at,
              COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
              COUNT(r.id)::int AS rating_count
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id, s.name, s.email, s.address, s.created_at
       ORDER BY s.created_at ASC`,
      [ownerId]
    );

    const stores = storesRes.rows;

    if (stores.length === 0) {
      return res.json({
        success: true,
        message: 'Owner dashboard data retrieved (No stores assigned yet)',
        data: {
          hasStore: false,
          stores: [],
          primaryStore: null,
          totalRatings: 0,
          averageRating: 0,
          ratings: []
        }
      });
    }

    // Combine stats across owned stores
    const storeIds = stores.map((s) => s.id);
    const primaryStore = stores[0];

    // Total ratings and average rating for owner
    const combinedStatsRes = await query(
      `SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS overall_average,
              COUNT(r.id)::int AS total_ratings
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE s.owner_id = $1`,
      [ownerId]
    );

    // List of users who submitted ratings:
    // Requirements: User Name, User Email, Rating, Rating date
    const ratingsRes = await query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              u.name AS user_name, u.email AS user_email, u.address AS user_address,
              s.id AS store_id, s.name AS store_name
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       JOIN stores s ON r.store_id = s.id
       WHERE s.owner_id = $1
       ORDER BY r.created_at DESC`,
      [ownerId]
    );

    res.json({
      success: true,
      message: 'Owner dashboard data retrieved successfully',
      data: {
        hasStore: true,
        stores,
        primaryStore,
        totalRatings: combinedStatsRes.rows[0].total_ratings,
        averageRating: combinedStatsRes.rows[0].overall_average,
        ratings: ratingsRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getOwnerRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { storeId, sortBy = 'created_at', order = 'desc' } = req.query;

    const allowedSort = {
      created_at: 'r.created_at',
      rating: 'r.rating',
      user_name: 'u.name'
    };
    const safeSort = allowedSort[sortBy] || 'r.created_at';
    const safeOrder = order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions = ['s.owner_id = $1'];
    const values = [ownerId];

    if (storeId) {
      values.push(storeId);
      conditions.push(`s.id = $${values.length}`);
    }

    const sql = `
      SELECT r.id, r.rating, r.created_at, r.updated_at,
             u.name AS user_name, u.email AS user_email,
             s.id AS store_id, s.name AS store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${safeSort} ${safeOrder}
    `;

    const result = await query(sql, values);

    res.json({
      success: true,
      message: 'Owner ratings retrieved successfully',
      data: {
        ratings: result.rows
      }
    });
  } catch (err) {
    next(err);
  }
};
