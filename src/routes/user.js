const express = require('express');
const ConnectionRequest = require('../models/connectionRequest');
const { userAuth } = require('../middlewares/auth');

const userRouter = express.Router();

//Get all pending requests 
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId", "firstName lastName profilePicture gender bio location experienceLevel skills"); 


        res.json({
            message: connectionRequests.length > 0 ? "Connection requests found" : "No requests found",
            data: connectionRequests,
        });
    }
    catch(err){
        res.status(500).json({
            message: "Internal Server Error" + err.message,
        });
    }
});


const DATA = "firstName lastName profilePicture gender bio location experienceLevel skills";
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connections = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" },
            ],
        })
        .populate({
            path: 'fromUserId',
            select: DATA
        })
        .populate({
            path: 'toUserId',
            select: DATA
        });

        // Map the connections to get connected user data
        const connectedUsers = connections.map(connection => {
            // If fromUserId is logged in user, return toUser details, else return fromUser details
            const connectedUser = connection.fromUserId._id.equals(loggedInUser._id) 
                ? connection.toUserId 
                : connection.fromUserId;
            
            // Only include the specified fields
            const { firstName, lastName, profilePicture, gender, bio, location, experienceLevel, skills } = connectedUser;
            return {
                connectionId: connection._id,
                user: {
                    firstName,
                    lastName,
                    profilePicture,
                    gender,
                    bio,
                    location,
                    experienceLevel,
                    skills
                },
                status: connection.status,
            };
        });

        res.json({
            message: "Connected users fetched successfully",
            data: connectedUsers
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error" + err.message,
        });
    }
});

module.exports = userRouter;