module.exports = (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
};
