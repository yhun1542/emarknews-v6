exports.notFound = (req, res) => {
  res.status(404).json({ error: 'Not Found' });
};
exports.errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
};
