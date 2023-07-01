const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

//@DESC        Get all bootcamps
//@ROUTE       GET /api/v1/bootcamps
//@ACCESS      public
exports.getBootcamps = asyncHandeler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});

//@DESC        Get specific bootcamp
//@ROUTE       GET /api/v1/bootcamps/:id
//@ACCESS      public
exports.getBootcamp = asyncHandeler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@DESC        Create new bootcamp
//@ROUTE       POST /api/v1/bootcamps
//@ACCESS      private
exports.createBootcamp = asyncHandeler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

//@DESC        Update specific bootcamp
//@ROUTE       PUT /api/v1/bootcamps/:id
//@ACCESS      private
exports.updateBootcamp = asyncHandeler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@DESC        Delete specific bootcamp
//@ROUTE       DELETE /api/v1/bootcamps/:id
//@ACCESS      private
exports.deleteBootcamp = asyncHandeler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: {} });
});
