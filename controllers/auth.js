const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const User = require('../models/User');

//@DESC        Register use
//@ROUTE       POST /api/v1/auth/register
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

  sendTokenResponse(user, 200, res);

  res.status(200).json({ success: true, token });
});

//@DESC        Register use
//@ROUTE       POST /api/v1/auth/login
//@ACCESS      Public
exports.login = asyncHandeler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate User and Password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }
  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);

  res.status(200).json({ success: true, token });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  // Lower case u of user because its called on a method not a static. A static would be capital User
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // secure = true sends cookie only over https
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  //.cookie is ("key", value, option)
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};
