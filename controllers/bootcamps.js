const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

//@DESC        Get all bootcamps
//@ROUTE       GET /api/v1/bootcamps
//@ACCESS      public
exports.getBootcamps = asyncHandeler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  bootcamp.deleteOne();
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

//@DESC        Upload photo for  bootcamp
//@ROUTE       PUT  /api/v1/bootcamps/:id/photo
//@ACCESS      Private
exports.bootcampPhotoUpload = asyncHandeler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload and image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  // create custom filename no one else can use
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // Move file to static folder
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    // insert file into database
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
