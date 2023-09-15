// if you bring in a new file make sure to add to server.js

const express = require('express');
const { getReviews, getReview } = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

// wherever protect is user has to be logged in to use route
// Make sure authorize comes after any protect. Since we call req.user which gets set inside the protect middleware
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(
  advancedResults(Review, {
    // populate takes in the path then the items you want to select to be added
    path: 'bootcamp',
    select: 'name description',
  }),
  getReviews
);

router.route('/:id').get(getReview);

module.exports = router;
