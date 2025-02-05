const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequest = require('../models/connectionRequest');

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId",userAuth, async (req, res) => {
    try {
        const { status, toUserId } = req.params;
        const fromUserId = req.user._id;

        //only ignored and interested status are allowed
        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status : " + status,
            })
        }

        if(!mongoose.isValidObjectId(toUserId)) {
            return res.status(400).json({
                message: "Invalid user ID format",
            });
        }

        //check if the user exists
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({
                message: "User not found",
            })
        }

        //check if the connection requests exists => not sending again or that person had sent the request
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId},
            ]
        })

        let data;
        if (existingConnectionRequest) {
            // If trying to update with the same status, return error
            if (existingConnectionRequest.status === status) {
                return res.status(400).json({
                    message: "Connection request already exists with same status",
                })
            }
            // Update the existing request with new status
            existingConnectionRequest.status = status;
            data = await existingConnectionRequest.save();
        } else {
            //create a new connection request
            const connectionRequest = new ConnectionRequest({
                fromUserId,
                toUserId,
                status,
            })
            //save the connection request
            data = await connectionRequest.save();
        }

        const statusMessage = status === "interested" 
            ? "Interest shown successfully"
            : "Profile ignored successfully";
            
        res.json({
            message: statusMessage,
            data,
        })

    } catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
})

requestRouter.post("/request/review/:status/:requestId",userAuth, async (req, res) => {
    try {
        const { status, requestId } = req.params;
        const loggedInUser = req.user;
        const allowedStatus = ["accepted", "rejected"];
        
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status : " + status,
            })
        }

        if(!mongoose.isValidObjectId(requestId)) {
            return res.status(400).json({
                message: "Invalid request ID format",
            });
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });

        if (!connectionRequest) {
            return res.status(404).json({
                message: "Connection request not found",
            })
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        const statusMessage = status === "accepted" 
            ? "Connection request accepted successfully"
            : "Connection request rejected successfully";
            
        res.json({
            message: statusMessage,
            data,
        }) 
    }
    catch (err) {
        res.status(500).send("Something went wrong: " + err.message);
    }
})

module.exports = requestRouter;