const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

//@DESC        Get courses
//@ROUTE       GET /api/v1/courses
//@ACCESS      Public
exports.getCourses = asyncHandeler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    // populate takes in the path then the items you want to select to be added
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description website',
    });
  }

  const courses = await query;

  res.status(200).json({ success: true, count: courses.length, data: courses });
});

//@DESC        Get single course
//@ROUTE       GET /api/v1/courses/:id
//@ACCESS      Public
exports.getCourse = asyncHandeler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({ success: true, data: course });
});

//@DESC        Add a course
//@ROUTE       GET /api/v1/bootcamps/:bootcampsId/courses
//@ACCESS      Private
exports.addCourse = asyncHandeler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
      404
    );
  }
  const course = await Course.create(req.body);

  res.status(200).json({ success: true, data: course });
});
