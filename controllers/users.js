const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const User = require('../models/User');

//@DESC        Get all users
//@ROUTE       GET /api/v1/users
//@ACCESS      Private/Admin
exports.getUsers = asyncHandeler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@DESC        Get single users
//@ROUTE       GET /api/v1/users/:id
//@ACCESS      Private/Admin
exports.getUser = asyncHandeler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

//@DESC        Create user
//@ROUTE       POST /api/v1/users
//@ACCESS      Private/Admin
exports.createUser = asyncHandeler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

//@DESC        Update user
//@ROUTE       PUT /api/v1/users/:id
//@ACCESS      Private/Admin
exports.updateUser = asyncHandeler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

//@DESC        Delete user
//@ROUTE       DELETE /api/v1/users/:id
//@ACCESS      Private/Admin
exports.deleteUser = asyncHandeler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});
