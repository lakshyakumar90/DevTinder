const socket = require('socket.io');
const crypto = require('crypto');
const Chat = require('../models/Chat');
const ConnectionRequest = require('../models/connectionRequest');

const getSecretRoomId = (userId, targetUserId) => {
    return crypto.createHash("sha256").update([userId, targetUserId].sort().join("$")).digest("hex");
}

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", ({ userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            socket.join(roomId);
        });
        socket.on("sendMessage", async ({ firstName, lastName, senderId, text, targetUserId, timestamp }) => {
            try {
                const isFriends = await ConnectionRequest.findOne({
                    $or: [
                        { fromUserId: senderId, toUserId: targetUserId },
                        { fromUserId: targetUserId, toUserId: senderId },
                    ],
                    status: "accepted",
                });

                if (!isFriends) {
                    return;
                }

                const roomId = getSecretRoomId(senderId, targetUserId);
                let chat = await Chat.findOne({
                    participants: { $all: [senderId, targetUserId] },
                })
                if (!chat) {
                    chat = new Chat({
                        participants: [senderId, targetUserId],
                        messages: [],
                    });
                }
                chat.messages.push({
                    senderId,
                    text,
                    timestamp,
                });
                await chat.save();
                io.to(roomId).emit("receiveMessage", { firstName, lastName, text, timestamp });
            } catch (err) {
                console.log(err);
            }
        });
        socket.on("disconnect", () => {

        });
    })
}

module.exports = initializeSocket;