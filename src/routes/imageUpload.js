const express = require("express");
const { upload } = require("../../cloudinaryConfig");
const User = require("../models/user"); // Import User model
const { userAuth } = require("../middlewares/auth");
const imageUploadRouter = express.Router();

// Upload profile picture
imageUploadRouter.post("/upload", upload.single("profilePic"), userAuth, async (req, res) => {
  try {
    const imageUrl = req.file.path; // Cloudinary returns the image URL
    const loggedInUser = req.user; // Get logged in user from userAuth middleware

    loggedInUser.profilePicture = imageUrl;
    await loggedInUser.save();

    res.json({ success: true, message: "Profile picture updated!", user: loggedInUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

imageUploadRouter.delete("/remove-profile-pic", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user; // Get user from middleware

    // Set the default profile picture
    const defaultProfilePic =
      "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg";

    loggedInUser.profilePicture = defaultProfilePic;
    await loggedInUser.save(); // Save changes in the database

    res.json({
      success: true,
      message: "Profile picture removed successfully!",
      user: loggedInUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = imageUploadRouter;

module.exports = imageUploadRouter;
