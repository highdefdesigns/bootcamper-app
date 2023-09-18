const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please enter a title'],
  },
  description: {
    type: String,
    required: [true, 'Please enter a desciption'],
  },
  weeks: {
    type: String,
    required: [true, 'Please enter number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log('Calculating avg cost...'.blue);

  const tobj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);

  let average;
  if (tobj.length > 0) {
    average = Math.ceil(tobj[0].averageCost / 10) * 10;
  } else {
    // Handle the scenario when there are no courses left for the bootcamp.
    // You can set the average to 0 or undefined based on your requirements.
    average = 0;
  }

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: average,
    });
  } catch (err) {
    console.log(err);
  }
};

// Call getAverageCost after save
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});
// Call getAverageCost after remove
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
