const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    maxlength: 300,
  },
  skills: {
    type: [String],
    default: [],
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  },
  location: {
    type: String,
  },
//   profilePicture: {
//     type: String, // URL to the profile picture
//   },
//   likes: {
//     type: [mongoose.Schema.Types.ObjectId],
//     ref: 'User',
//     default: [],
//   },
//   dislikes: {
//     type: [mongoose.Schema.Types.ObjectId],
//     ref: 'User',
//     default: [],
//   },
//   matches: {
//     type: [mongoose.Schema.Types.ObjectId],
//     ref: 'User',
//     default: [],
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
});


module.exports = mongoose.model('User', userSchema);;
