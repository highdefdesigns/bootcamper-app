const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// complete js empimentation of bcrypt
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  // MAKE EMAIL SO ITS NOT CASE SENSITIVE ie YOU CAN REGISTER sarah@gmail.com and Sarah@gmail.com as two accounts and it should not do that.
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  // target user error someday if enum is not chosen
  // in order to make a user an admin you must do that through MONGODB Atlas and edit it through there
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  // 10 is recommended in docs
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
// a mongoose method (called on initiallize model ie the User) not middelware where it runs automatically but a method where you have to call it
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
