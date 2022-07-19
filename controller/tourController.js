const fs = require('fs');
const { nextTick } = require('process');
const slugify = require('slugify');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTour = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitedFields()
    .pagination();
  const tours = await features.query;

  //query.sort().select().skip().limit()

  // SEND RESPONSE
  res.status(200).json({
    message: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //nếu req.params.id  mà rỗng khi nhân với 1 thì nó sẽ chuyển thành 1 -- trick of javascript
  // const id = req.params.id;

  // const tour = await Tour.findOne({ _id: id });
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    message: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const slugs = slugify(req.body.name && req.body.name, { lower: true });
  // console.log(slugs);
  // const newTour = await Tour.create(
  //   Object.assign({ ...req.body, slugs: `${slugs}` })
  // );
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    message: 'success',
    data: {
      tours: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const slugs = slugify(req.body.name && req.body.name, { lower: true });
  const tour = await Tour.findByIdAndUpdate(
    req.params.id,
    { ...req.body, slugs: slugs },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.deleteOne({ _id: req.params.id });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getTourStats = catchAsync(async (req, res, next) => {
  /* 
    $match: chọn document mong muốn truy vấn.
    $group: nhóm các document theo điều kiện nhất định,
    $project: được dùng để chỉ định các field sẽ xuất hiện trong output document
              -_id: <0 or false>: field _id sẽ không xuất hiện trong output document (mặc định _id luôn xuất hiện trong output document).
              -<field X>: <1 or true>: field X sẽ xuất hiện trong output document.
              -<field X>: <expression>: field X sẽ được tính toán dựa trên một expression nào đó.
    ---------------------------------------------------------- 

    $avg: Tính trung bình của tất cả giá trị đã cho từ tất cả Document trong Collection đó
    $min: lấy giá trị nhỏ nhất của các giá trị từ tất cả Document trong Collection đó
    $max: lấy giá trị lớn nhất của các giá trị từ tất cả Document trong Collection đó
    $month: lấy ra tháng
 
 */

  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTour: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      // $sort: { numTourStarts: -1 }, //DESC
      $sort: { numTourStarts: 1 }, //ASC
    },
    {
      $limit: 2,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
