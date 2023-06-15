const express = require('express');
const router = express.Router();

//@DESC        get all bootcamps
//@ROUTE       GET /api/v4/bootcamps
//@ACCESS      public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show all bootcamps' });
};

//@DESC        get specific bootcamp
//@ROUTE       GET /api/v4/bootcamps/:id
//@ACCESS      public
exports.getBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Show specific bootcamp ${req.params.id}` });
};

//@DESC        create new bootcamp
//@ROUTE       POST /api/v4/bootcamps
//@ACCESS      private
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Post a bootcamp' });
};

//@DESC        update specific bootcamp
//@ROUTE       PUT /api/v4/bootcamps/:id
//@ACCESS      private
exports.updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

//@DESC        delete specific bootcamp
//@ROUTE       DELETE /api/v4/bootcamps/:id
//@ACCESS      private
exports.deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};
