const { Server } = require("socket.io");

const io = new Server({ cors: "https://yuzen9622.github.io" });
let onlineUsers = []
io.on("connection", (socket) => {

    socket.on("addNewUser", (userId) => {
        if (userId === null) return
        !onlineUsers.some((user) => user.userId === userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id

            })

        io.emit("getonlineUsers", onlineUsers)
    })
    socket.on("InchatUser", (userChat) => {
        const user = onlineUsers.find((user1) => user1.userId === userChat.recipientId);
        if (user) {
            io.to(user.socketId).emit("getInChatUser", userChat)
        }
    })
    socket.on("sendMessage", (message) => {
        console.log(onlineUsers.find((user1) => user1.userId == message.recipientId))
        const user = onlineUsers.find((user1) => user1.userId === message.recipientId);

        if (user) {
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", {
                senderId: message.senderId,
                isRead: false,
                date: new Date(),
                text: message.text
            })
        }

    })

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
        io.emit("getonlineUsers", onlineUsers)

    })
});
let port = 8080
console.log("socket Server listen at", port)
io.listen(port);