const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const User = require('../models/User');

//@DESC        Register use
//@ROUTE       GET /api/v1/auth/register
//@ACCESS      Public
exports.register = asyncHandeler(async (req, res, next) => {
  res.status(200).json({ success: true });
});
