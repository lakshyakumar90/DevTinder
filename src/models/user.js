const mongoose = require('mongoose');
var validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [3, 'First name must be at least 3 characters'],
    maxlength: [50, 'First name must be at most 50 characters'],
  },
  lastName: {
    type: String,
    trim: true,
    minlength: [3, 'Last name must be at least 3 characters'],
    maxlength: [50, 'Last name must be at most 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid' + value);
      }
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [20, 'Password must be at most 20 characters'],
    validate(value) {
      if (!validator.isStrongPassword(value)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
    },
    age: {
      type: Number,
      min: [18, 'Age must be at least 18'],
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio must be at most 300 characters'],
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skillsArray) {
          return skillsArray.length <= 12;
        },
        message: 'You can have at most 5 skills.'
      }
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        message: 'Experience level must be either Beginner, Intermediate, Advanced, or Expert',
      },
    },
    location: {
      type: String,
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
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender must be "male", "female", or "other"',
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    matches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
}, {
  timestamps: true,
});

// Virtual property for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName || ''}`.trim();
});

// Optionally, add a pre-save hook to hash the password before saving:
// userSchema.pre('save', async function(next) {
//   if (this.isModified('password')) {
//     // Hash password logic here (e.g., using bcrypt)
//   }
//   next();
// });

module.exports = mongoose.model('User', userSchema);
