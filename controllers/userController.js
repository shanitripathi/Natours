// const fs = require('fs');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// READING THE RESOURCE FILE

// const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

const filterObj = (obj, ...allowedKeys) => {
  Object.keys(obj).forEach((key) => {
    if (!allowedKeys.includes(key)) {
      delete obj[key];
    }
  });
  return obj;
};

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-__v');
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

//use this to delelte all users

// exports.deleteAllUsers = async (req, res, next) => {
//   try {
//     const deletedUsers = await User.deleteMany();
//     res.status(204).json({
//       status: 'success',
//       data: {
//         deletedUsers,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: 'Invalid Request',
//     });
//   }
// };

exports.deleteAllUsers = catchAsync(async (req, res, next) => {
  const response = await User.deleteMany();
  res.status(204).json({
    status: 'success',
    message: 'All Users deleted',
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // create an error if the user tries to update the password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use /updatePassword',
        400
      )
    );
  }

  // update the user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
