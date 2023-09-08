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
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

// wherever protect is user has to be logged in to use route
const { protect } = require('../middleware/auth');

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
  .post(protect, addCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

module.exports = router;
