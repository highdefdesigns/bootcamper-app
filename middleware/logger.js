// @desc Logs request to console

const logger = (req, res, next) => {
  console.log(
    `Logger: ${req.method} ${req.protocol}://${req.get('host')}${
      req.originalUrl
    } ${res.statusCode}`
  );
  next();
};

module.exports = logger;
