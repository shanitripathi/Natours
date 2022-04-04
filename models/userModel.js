const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide your email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  photo: {
    type: String,
    default: 'somthing',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    maxLength: [40, 'A password must be less than 40 characters'],
    minLength: [8, 'A password must be at least 8 characters long'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works on create and save!
      validator: function (el) {
        return this.password === el;
      },
      message: 'Passwords dont match!',
    },
  },
  role: {
    type: String,
    enum: ['admin', 'lead-guide', 'guide', 'user'],
    default: 'user',
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); //greater the salt value higher the cpu processing will be
  this.passwordConfirm = undefined; //deletes a field from the schema and it won't be persisted to the database
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this is a query middleware so this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.checkPassword = async function (
  enteredPassword,
  DBPassword
) {
  return await bcrypt.compare(enteredPassword, DBPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (!this.passwordChangedAt) return false;
  const convertedDate = this.passwordChangedAt.getTime() / 1000;
  return convertedDate > jwtTimestamp; //if password was changed after the supplied timestamp than return true else false
};

userSchema.methods.createPasswordResetToken = function () {
  //create the token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // encryt the token as it will be saved in the database

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken, passwordResetToken: this.passwordResetToken });
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
