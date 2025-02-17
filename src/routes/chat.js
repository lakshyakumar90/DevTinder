const express = require('express');
const Chat = require('../models/Chat');
const { userAuth } = require('../middlewares/auth');

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const userId = req.user._id;
    
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 50;
    limit = limit > 50 ? 50 : limit;

    try {
        let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName"
        })

        if (!chat) {
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: []
            })
        }
        await chat.save();

        // const messages = chat.messages.slice(-messageLimit);
        const totalMessages = chat.messages.length;
        const skip = Math.max(0, totalMessages - page * limit);
        const messages = chat.messages.slice(-limit - skip, chat.messages.length - skip);

        res.status(200).json({
            message: "Chat found",
            data: {
                ...chat.toObject(),
                messages,
                pagination: {
                    totalMessages,
                    page,
                    limit,
                    totalPages: Math.ceil(totalMessages / limit),
                    hasMore: skip > 0, // True if there are more messages to fetch
                },
            },
        })
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error" + err.message
        })
    }
})

module.exports = chatRouter;