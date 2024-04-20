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
        console.log(onlineUsers)
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

socket.on("typing",(req)=>{
    
    const user = onlineUsers.find((user1) => user1.userId == req.recipientId);
    console.log(user)
    if(user){
        io.to(user.socketId).emit("userTyping",{id:req.id,istype:req?.status})
    }
    

})


socket.on("callUser", (data) => {
    const calluser = onlineUsers?.find((users) => users.userId === data.id);
 if(!calluser)return io.to(data.from).emit("callAccepted",false)
    if (calluser)
    console.log("send call")
      io.to(calluser.socketId).emit("getCall", {
   
        signal: data.signalData,
        from: data.from,
        name: data.name,
        iscamera:data.iscamera
      });
  });

  socket.on("answerCall", (data) => {
    const calluser = onlineUsers?.find((users) => users.userId === data.to);
    if(calluser)
    io.to(calluser.socketId).emit("callAccepted", data.signal);
  });


socket.on("callend",(data)=>{
    const calluser = onlineUsers?.find((users) => users.userId === data);
    if(calluser) 
    io.to(calluser.socketId).emit("callEnded");
})

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
        io.emit("getonlineUsers", onlineUsers)

    })
});
let port = 8080
console.log("socket Server listen at", port)
io.listen(port);