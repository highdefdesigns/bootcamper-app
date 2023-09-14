// if you bring in a new file make sure to add to server.js

const express = require('express');
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courses');

const Course = require('../models/Course');

const router = express.Router({ mergeParams: true });

// wherever protect is user has to be logged in to use route
// Make sure authorize comes after any protect. Since we call req.user which gets set inside the protect middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Course, {
      // populate takes in the path then the items you want to select to be added
      path: 'bootcamp',
      select: 'name description website',
    }),
    getCourses
  )
  .post(protect, authorize('publisher', 'admin'), addCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
