const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

//@DESC        Get courses
//@ROUTE       GET /api/v1/courses
//@ACCESS      Public
exports.getCourses = asyncHandeler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else {
    res.status(200).json(res.advancedResults);
  }
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

//@DESC        Add course
//@ROUTE       POST /api/v1/bootcamps/:bootcampsId/courses
//@ACCESS      Private
exports.addCourse = asyncHandeler(async (req, res, next) => {
  // got bootcamp id from params and put into req.boduy
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
      404
    );
  }

  // Make sure bootcamp owner is the user logged in
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({ success: true, data: course });
});

//@DESC        Update course
//@ROUTE       PUT /api/v1/courses/:id
//@ACCESS      Private
exports.updateCourse = asyncHandeler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: course });
});

//@DESC        Delete course
//@ROUTE       DELETE /api/v1/courses/:id
//@ACCESS      Private
exports.deleteCourse = asyncHandeler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }

  await course.deleteOne({ _id: course._id });

  await Course.getAverageCost(course.bootcamp);

  res.status(200).json({ success: true, data: {} });
});
