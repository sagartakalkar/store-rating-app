import { query } from '../config/db.js';

export const submitRating = async (req, res, next) => {
  try {
    const { store_id, rating } = req.body;
    const userId = req.user.id;
    const ratingNum = parseInt(rating, 10);

    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Verify store exists
    const storeRes = await query('SELECT id, name FROM stores WHERE id = $1', [store_id]);
    if (storeRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Check if user already submitted rating for this store
    const existingRes = await query(
      'SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, store_id]
    );

    let resultRating;
    let isUpdate = false;

    if (existingRes.rows.length > 0) {
      // If already exists, update it to seamlessly fulfill "allow the user to update it"
      const ratingId = existingRes.rows[0].id;
      const updateRes = await query(
        `UPDATE ratings
         SET rating = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, user_id, store_id, rating, created_at, updated_at`,
        [ratingNum, ratingId]
      );
      resultRating = updateRes.rows[0];
      isUpdate = true;
    } else {
      const insertRes = await query(
        `INSERT INTO ratings (user_id, store_id, rating)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, store_id, rating, created_at, updated_at`,
        [userId, store_id, ratingNum]
      );
      resultRating = insertRes.rows[0];
    }

    // Recompute store average and count
    const statsRes = await query(
      `SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating,
              COUNT(id)::int AS rating_count
       FROM ratings
       WHERE store_id = $1`,
      [store_id]
    );

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate ? 'Rating updated successfully' : 'Rating submitted successfully',
      data: {
        rating: resultRating,
        storeStats: statsRes.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
};

export const modifyRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;
    const ratingNum = parseInt(rating, 10);

    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5'
      });
    }

    // Verify rating exists and belongs to user (or user is ADMIN)
    const existingRes = await query('SELECT * FROM ratings WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rating record not found'
      });
    }

    const currentRating = existingRes.rows[0];
    if (currentRating.user_id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own ratings'
      });
    }

    const updateRes = await query(
      `UPDATE ratings
       SET rating = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, user_id, store_id, rating, created_at, updated_at`,
      [ratingNum, id]
    );

    const statsRes = await query(
      `SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating,
              COUNT(id)::int AS rating_count
       FROM ratings
       WHERE store_id = $1`,
      [currentRating.store_id]
    );

    res.json({
      success: true,
      message: 'Rating modified successfully',
      data: {
        rating: updateRes.rows[0],
        storeStats: statsRes.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getStoreRatings = async (req, res, next) => {
  try {
    const { storeId } = req.params;

    const ratingsRes = await query(
      `SELECT r.id, r.rating, r.created_at, r.updated_at,
              u.name AS user_name, u.email AS user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    const statsRes = await query(
      `SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating,
              COUNT(id)::int AS rating_count
       FROM ratings
       WHERE store_id = $1`,
      [storeId]
    );

    res.json({
      success: true,
      message: 'Store ratings retrieved',
      data: {
        ratings: ratingsRes.rows,
        stats: statsRes.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
};
