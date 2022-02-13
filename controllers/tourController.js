const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// It is a good practice to check for errors in middleware like invaild id so the request doesn't go the the next phase! it keeps the controllers clean
// exports.checkValidId = (req, res, next, val) => {
//   const id = val * 1;
//   const tour = getTourWithId(id);
//   if (!tour)
//     return res.status(404).json({
//       status: 'fail',
//       data: 'Invalid ID',
//     });
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTours = async (req, res) => {
  try {
    //building the query
    // 1. Filtering
    // const queryObj = { ...req.query };
    // const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach((ele) => {
    //   return delete queryObj[ele];
    // });
    // 2. Advance Filtering
    // let queryString = JSON.stringify(queryObj);
    // //replace all the operators with a $ in front of them
    // queryString = queryString.replace(
    //   /\b(gte|gt|lt|lte)\b/g,
    //   (match) => `$${match}`
    // );

    // console.log(JSON.parse(queryString));
    // let query = Tour.find(JSON.parse(queryString));

    // 3. Sorting
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    // } else {
    //   query = query.sort('-createdAt'); //sort by date
    // }

    // 4. Field limiting (requesting only certain fields)

    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // } else {
    //   query = query.select('-__v');
    // }

    // pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;

    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('the page doesnt exist');
    // }

    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    // execute query

    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    console.log(err, 'error');
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //same as Tour.findOne({_id:req.params.id})
    res.json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err,
    });
  }
  // if (Object.keys(body).every((field) => Object.keys(tour).includes(field))) {
  //   const updatedTour = {
  //     ...tour,
  //     ...body,
  //   };

  //   res.json({
  //     status: 'success',
  //     data: {
  //       tour: updatedTour,
  //     },
  //   });
  // } else {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'Incorrect Field',
  //   });
  // }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    //add logic to delete the resource
    res.status(204).json({
      //204 means no content in body
      status: 'success',
      data: tour,
    });
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
      // {
      //   $match: { _id: { $ne: 'easy' } },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

/* Aggregation Rules
1. Cannot pass empty pipeline
2. All data properties will come with a $ operator as a prefix (except for match stage)

*/

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year;
    const plan = await Tour.aggregate([
      // {
      //   $match: { ratingsAverage: { $gte: 4.8 } },
      // },
      {
        $unwind: { path: '$startDates' },
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
          numTours: { $sum: 1 },
          name: { $push: '$name' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $addFields: { month: '$_id' }, // adds a new field called month and sets its value to its respective _id
      },
      {
        $project: {
          _id: 0, //if 0 then excludes the fields if 1 then sends that field only
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      results: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
