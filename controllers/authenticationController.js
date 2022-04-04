const util = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const token = signJwtToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

/*
when logging in the first thing we want to do is to check if the supplied email and passwords fields match the ones in our database
we get the user with the email id field
if we have any user then we go on to decrytp the password that was in our database
then we match the two passwords and if they are okay then we create a jwt token and sent it back as response
*/

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  let token = signJwtToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1 get the token and check if it exists
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in, please log in again to access', 401)
    );
  }
  // 2 validate the token - jwt verification

  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  // 3 if the user exists in our database - example a deleted user

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }

  // user changed passwords after jwt was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('The password was changed recently, please login again', 401)
    );
  }
  // grant access to the user
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // here because of closure we have access to the roles argument in the middleware function
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you are not authorized to perform this operation!', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get the users email address and see if he exists in our database
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('There is no user with the current email address', 404)
    );
  }

  // if he does, then create a new reset token and send it over to him - make an instance function that does that
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send the token over to the user
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to: ${resetUrl}.\n If you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token is only valid for 10 minutes',
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email! Try again later', 500)
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'token sent to email',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1 get the user based on the reset token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2 if the token has not expired and the user exists then change the passwrord
  if (!user) {
    return next(
      new AppError('Token has expired or is invalid, Please try again', 400)
    );
  }

  // now we want to reset the values
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3 update changedPasswordAt for the user
  // send the jwt token to the user so that he has access
  const token = signJwtToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1 get the user from the protect middleware

  const user = await User.findById(req.user.id).select('+password');
  console.log(user.password);
  // check if current password and new password are not the same
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  if (await user.checkPassword(req.body.password, user.password)) {
    return next(new AppError('Cannot use the same password again', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // get new token
  const token = signJwtToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
