const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const User = require('../models/User');

//@DESC        Register use
//@ROUTE       GET /api/v1/auth/register
//@ACCESS      Public
exports.register = asyncHandeler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create token
  // Lower case u of user because its called on a method not a static. A static would be capital User
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});
