const socket = require('socket.io');

const initializeSocket = (server) =>{
    const io = socket(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    io.on("connection", (socket)=>{
        socket.on("joinChat", ({ userId, targetUserId}) => {
            const roomId = [userId, targetUserId].sort().join("-");
            socket.join(roomId);
        });
        socket.on("sendMessage", ({firstName, lastName, senderId, text, targetUserId, timestamp}) => {
            const roomId = [senderId, targetUserId].sort().join("-");
            io.to(roomId).emit("receiveMessage", {firstName, lastName, text, timestamp});
        });
        socket.on("leaveChat", () => {
            
        });
        socket.on("disconnect", () => {
            
        });
    })
}  

module.exports = initializeSocket;