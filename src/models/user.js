const mongoose = require('mongoose');
var validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email is unique
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid: ' + value);
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    validate(value) {
      if (!validator.isStrongPassword(value)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
    }
  },
  age: {
    type: Number,
    required: true,
    min: 18,
  },
  bio: {
    type: String,
    maxlength: 300,
  },
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function (skillsArray) {
        return skillsArray.length <= 12;
      },
      message: 'You can have at most 12 skills.'
    }
  },
  experienceLevel: {
    type: String,
    lowercase: true,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
  },
  location: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default:
      'https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg',
    validate(value) {
      if (!validator.isURL(value)) {
        throw new Error('Invalid URL');
      }
    }
  },
  gender: {
    type: String,
    lowercase: true,
    required: true,
    enum: ['male', 'female', 'other'],
  },
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
