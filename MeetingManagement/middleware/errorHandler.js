function errorHandler(err, req, res, next) {
  const status =
    typeof err.statusCode === 'number' && err.statusCode >= 400
      ? err.statusCode
      : 500;

  let errorType = 'InternalServerError';
  if (status === 400) errorType = 'ValidationError';
  else if (status === 404) errorType = 'NotFoundError';
  else if (status === 409) errorType = 'ConflictError';

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    error: errorType,
    message: err.message || 'Unexpected error',
  });
}

module.exports = { errorHandler };

