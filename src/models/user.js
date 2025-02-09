require('dotenv').config();

const mongoose = require('mongoose');
var validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long.'],
      maxlength: [50, 'First name cannot exceed 50 characters.'],
    },
    lastName: {
      type: String,
      trim: true,
      minlength: [3, 'Last name must be at least 3 characters long.'],
      maxlength: [50, 'Last name cannot exceed 50 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: [true, 'Email already exists.'], // Ensures email is unique
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: (props) => `Email is invalid: ${props.value}`,
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      trim: true,
      minlength: [8, 'Password must be at least 8 characters long.'],
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value);
        },
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      },
    },
    age: {
      type: Number,
      required: [true, 'Age is required.'],
      min: [18, 'You must be at least 18 years old.'],
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters.'],
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skillsArray) {
          return new Set(skillsArray).size === skillsArray.length && skillsArray.length <= 12;
        },
        message: 'Skills must be unique and at most 12.',
      },
    },
    experienceLevel: {
      type: String,
      lowercase: true,
      required: [true, 'Experience level is required.'],
      enum: {
        values: ['beginner', 'intermediate', 'advanced', 'expert'],
        message: 'Experience level must be one of: beginner, intermediate, advanced, expert.',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required.'],
    },
    profilePicture: {
      type: String,
      default: 'https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg',
      validate: {
        validator: function (value) {
          return validator.isURL(value);
        },
        message: 'Invalid URL for profile picture.',
      },
    },
    gender: {
      type: String,
      lowercase: true,
      required: [true, 'Gender is required.'],
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender must be one of: male, female, other.',
      },
    },
  },
  { timestamps: true }
);
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});


userSchema.methods.signJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const hashedPassword = user.password;
  return await bcrypt.compare(passwordInputByUser, hashedPassword);
}

module.exports = mongoose.model('User', userSchema);
