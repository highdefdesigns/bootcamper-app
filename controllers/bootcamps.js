const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

//@DESC        Get all bootcamps
//@ROUTE       GET /api/v1/bootcamps
//@ACCESS      public
exports.getBootcamps = asyncHandeler(async (req, res, next) => {
  let query;

  // Copy of req/query
  const reqQuery = { ...req.query };

  // fields to exclude
  const removeFields = ['select', 'sort'];
  // loop over removeFields to find one to exclude
  removeFields.forEach((param) => delete reqQuery[param]);

  // Allows us to make query searches
  let queryStr = JSON.stringify(reqQuery);
  console.log(queryStr);
  // create query search operator $gt|$gte...
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Find resource
  query = Bootcamp.find(JSON.parse(queryStr));
  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query.select(fields);
  }
  // Sort Fields
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Execute query
  const bootcamps = await query;
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

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandeler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
