const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  const error = new Error(\`Not Found - \${req.originalUrl}\`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  logger.error(err.message);
  res.status(statusCode).json({
    success: false,
    error: err.message
  });
};

module.exports = { notFound, errorHandler };
