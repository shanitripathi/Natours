const fs = require('fs');
const Tour = require('../models/tourModel');

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

exports.getTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
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

  res.send('yes tour updated!!');
};

exports.deleteTour = (req, res) => {
  // const tour = getTourWithId(req.params.id * 1);
  //add logic to delete the resource
  res.status(204).json({
    //204 means no content in body
    status: 'success',
    data: null,
  });
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
      message: err,
    });
  }
};
