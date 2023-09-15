const ErrorResponse = require('../utils/errorResponse');
const asyncHandeler = require('../middleware/async');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

//@DESC        Get reviews
//@ROUTE       GET /api/v1/bootcamps/:bootcampId/reviews
//@ACCESS      Public
exports.getReviews = asyncHandeler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@DESC        Get single reviews
//@ROUTE       GET /api/v1/reviews/:id
//@ACCESS      Public
exports.getReview = asyncHandeler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: review });
});
