export const errorMiddleware = (err, req, res, next) => {
  console.error('[Error Middleware]', err);

  // Handle unique constraint violations in PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with these unique details already exists.'
    });
  }

  // Handle foreign key constraint violations
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced entity does not exist.'
    });
  }

  // Handle check constraint violations
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Data constraint violation. Please verify input requirements.'
    });
  }

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred'
  });
};

export default errorMiddleware;
