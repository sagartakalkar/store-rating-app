import { query } from '../config/db.js';

export const getStores = async (req, res, next) => {
  try {
    const {
      name,
      address,
      sortBy = 'name',
      order = 'asc',
      page = 1,
      limit = 50
    } = req.query;

    const currentUserId = req.user ? req.user.id : null;

    const allowedSortCols = {
      name: 's.name',
      address: 's.address',
      created_at: 's.created_at',
      average_rating: 'average_rating',
      rating_count: 'rating_count'
    };

    const safeSortCol = allowedSortCols[sortBy] || 's.name';
    const safeOrder = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const conditions = [];
    const values = [];

    if (name && name.trim()) {
      values.push(`%${name.trim()}%`);
      conditions.push(`s.name ILIKE $${values.length}`);
    }

    if (address && address.trim()) {
      values.push(`%${address.trim()}%`);
      conditions.push(`s.address ILIKE $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Total count
    const countSql = `SELECT COUNT(*)::int AS total FROM stores s ${whereClause}`;
    const countRes = await query(countSql, values);
    const totalCount = countRes.rows[0].total;

    // Include user's own rating if authenticated
    let userRatingSelect = 'NULL AS user_rating, NULL AS user_rating_id';
    let userRatingParamIndex = null;

    if (currentUserId) {
      values.push(currentUserId);
      userRatingParamIndex = values.length;
      userRatingSelect = `
        (SELECT r_user.rating FROM ratings r_user WHERE r_user.store_id = s.id AND r_user.user_id = $${userRatingParamIndex}) AS user_rating,
        (SELECT r_user.id FROM ratings r_user WHERE r_user.store_id = s.id AND r_user.user_id = $${userRatingParamIndex}) AS user_rating_id
      `;
    }

    const sql = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
             COUNT(r.id)::int AS rating_count,
             ${userRatingSelect}
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id, s.name, s.email, s.address, s.created_at
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

export const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const storeRes = await query(
      `SELECT s.id, s.name, s.email, s.address, s.created_at, s.owner_id,
              u.name AS owner_name,
              COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
              COUNT(r.id)::int AS rating_count
       FROM stores s
       LEFT JOIN users u ON s.owner_id = u.id
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = $1
       GROUP BY s.id, s.name, s.email, s.address, s.created_at, s.owner_id, u.id, u.name`,
      [id]
    );

    if (storeRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const store = storeRes.rows[0];

    // Get current user's rating for this store if logged in
    let userRating = null;
    if (currentUserId) {
      const userRatingRes = await query(
        'SELECT id, rating, created_at, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2',
        [currentUserId, id]
      );
      if (userRatingRes.rows.length > 0) {
        userRating = userRatingRes.rows[0];
      }
    }

    // Get breakdown of star ratings
    const breakdownRes = await query(
      `SELECT rating, COUNT(*)::int AS count
       FROM ratings
       WHERE store_id = $1
       GROUP BY rating
       ORDER BY rating DESC`,
      [id]
    );

    res.json({
      success: true,
      message: 'Store details retrieved',
      data: {
        store,
        userRating,
        ratingBreakdown: breakdownRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
};
