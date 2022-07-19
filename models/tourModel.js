const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const validator = require('validator');
const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A tour must have a name'],
      trim: true,
      unique: true,
      maxlength: [40, 'A tour name must have less or qual then 40 characters'],
      minlength: [10, 'A tour name must have more or qual then 10 characters'],
      validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slugs: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a group duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is eitherL easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be above 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE} ) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      require: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      // required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

TourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
TourSchema.pre('save', function (next) {
  this.slugs = slugify(this.name, { lower: true });
  next();
});
// TourSchema.pre('save', function (next) {
//   console.log('will save document...');
//   next();
// });

// TourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE

TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

TourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);

  next();
});

// AGGREGATION MIDDLEWARE

TourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
//create modal
const Tour = mongoose.model('Tour', TourSchema);
module.exports = Tour;
