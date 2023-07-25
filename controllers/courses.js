const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const Course = require('../models/Course');

//@DESC        Get courses
//@ROUTE       GET /api/v1/course
//@ROUTE       GET /api/v1/bootcamps/:bootcampId/courses
//@ACCESS      public
exports.getCourses = asyncHandeler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find();
  }

  const courses = await query;

  res.status(200).json({ success: true, count: courses.length, data: courses });
});
