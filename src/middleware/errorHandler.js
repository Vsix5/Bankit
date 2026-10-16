import AppError from '../utils/AppError.js';

export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err instanceof AppError || statusCode < 500
    ? err.message
    : 'Internal server error';

  if (!(err instanceof AppError)) {
    console.error(err)
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    error: message
  })
}