const socket = require('socket.io');
const crypto = require('crypto');

const getSecretRoomId = (userId, targetUserId) => {
    return crypto.createHash("sha256").update([userId, targetUserId].sort().join("$")).digest("hex");
}

const initializeSocket = (server) =>{
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    io.on("connection", (socket)=>{
        socket.on("joinChat", ({ userId, targetUserId}) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            socket.join(roomId);
        });
        socket.on("sendMessage", ({firstName, lastName, senderId, text, targetUserId, timestamp}) => {
            const roomId = getSecretRoomId(senderId, targetUserId);
            io.to(roomId).emit("receiveMessage", {firstName, lastName, text, timestamp});
        });
        socket.on("leaveChat", () => {
            
        });
        socket.on("disconnect", () => {
            
        });
    })
}  

module.exports = initializeSocket;