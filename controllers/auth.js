const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

//@DESC        Register user
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
});

//@DESC        Login user
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
});

//@DESC        Get current logged in user
//@ROUTE       POST /api/v1/auth/me
//@ACCESS      Private
exports.getMe = asyncHandeler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  /* 
  needs an error response to say user not authenticated. Right now it says "success": false, "error": "Not authorized to access this route" --- This error is located in middleware/auth for verifiyng token
  */

  res.status(200).json({ success: true, data: user });
});

//@DESC        Update user details
//@ROUTE       PUT /api/v1/auth/updatedetails
//@ACCESS      Private
exports.updateDetails = asyncHandeler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

//@DESC        Update Password
//@ROUTE       PUT /api/v1/auth/updatepassword
//@ACCESS      Private
exports.updatePassword = asyncHandeler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@DESC        Forgot Password
//@ROUTE       POST /api/v1/auth/forgotpassword
//@ACCESS      Public
exports.forgotPassword = asyncHandeler(async (req, res, next) => {
  // Find one pass in an object and match email to req.body.email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token;
  const resetToken = user.getResetPasswordToken();

  // console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `Your are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
  // having the below res.status caused an ERROR of  code: 'ERR_HTTP_HEADERS_SENT'
  // res.status(200).json({ success: true, data: user });
});

//@DESC        Reset password
//@ROUTE       PUT /api/v1/auth/resetpassword/:resettoken
//@ACCESS      Public
exports.resetPassword = asyncHandeler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  console.log(req.params);

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// ============= HELPER FUNCTIONS
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
