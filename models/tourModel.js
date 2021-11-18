const mongoose = require('mongoose');

const slugify = require('slugify');

const validator = require('validator');

//const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'Tour Must Have Name'],
      unique: true,
      trim: true,
      maxlength: [40, 'a tour name must have less or equal than 40 characters'],
      minlength: [10, 'a tour name must have more or equal than 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      require: [true, 'Tour Must have Duration'],
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'Tour Must have Group Size'],
    },
    difficulty: {
      type: String,
      require: [true, 'Tour Must have Difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        messages: 'Difficulty id either :easy , medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1'],
      max: [5, 'rating must be below 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, 'Tour Must Have Price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //for new document creation only
          return val < this.price;
        },
        message: 'discount price({VALUE}) should be below regular price ',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      require: [true, 'Tour Must Have Description'],
    },
    imageCover: {
      type: String,
      require: [true, 'Tour Must Have Cover Image'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//tourSchema.index({ price: 1 });

tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// document middleware run before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));

//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// tourSchema.pre('save', (next) => {
//   console.log('will save document');
//   next();
// });

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

//query middleware

//tourSchema.pre('find', function (next)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, (docs, next) => {
  //console.log(`query took ${Date.now - this.start} milliseconds`);

  next();
});

// aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
