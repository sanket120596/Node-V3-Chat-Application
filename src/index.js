const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const { generateMessage, generateLocation } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users")

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let count = 0;
const adminName = "Admin"
io.on("connection", (socket) => {
  console.log("New WebSocket connection");
  // count++
  // socket.emit('countUpdated',count)

  // socket.on('increment',()=>{
  //     count++
  //    // socket.emit('countUpdated',count)
  //    io.emit('countUpdated',count)
  // })

  //emit message to particular socket
  //socket.emit("message", generateMessage("Hi welcome to chat app"));
  //emit to all sockets except iteself
  //socket.broadcast.emit("message", generateMessage("New user joined"));
  
  socket.on("join",({username,room},callback)=>{

    const {error , user} = addUser({id:socket.id, username,room})
    
    if(error){
      return callback(error)
    }
    
    socket.join(user.room)

    //emit message to particular socket in room
    socket.emit("message", generateMessage(adminName,`Hi ${user.username}, Welcome to chat app`));

    //emit to all sockets except iteself of room
    socket.broadcast.to(user.room).emit( generateMessage(adminName,`${user.username} joined`));
    
    io.to(user.room).emit('roomData',{
      room : user.room,
      users : getUsersInRoom(user.room)
    })

    callback()

  })

  socket.on("sendMessage", (message, callback) => {
    
    const user = getUser(socket.id)

    //emit to particular room
    io.to(user.room).emit("message", generateMessage(user.username,message));
    
    //emit to all clients including itself
    //io.emit("message", generateMessage(message));
    callback("message delivered");
  });

  socket.on("sendLocation", (coords, callback) => {
    
    const user = getUser(socket.id)

    io.to(user.room).emit( "sendLocation",generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback("location sent");
  });

  socket.on("disconnect",()=>{
    const user = removeUser(socket.id)

    if(user) {
      io.to(user.room).emit('message', generateMessage(adminName,`${user.username} has left`))
      io.to(user.room).emit('roomData',{
        room : user.room,
        users : getUsersInRoom(user.room)
      })
    }

  })

});

server.listen(port, (resp) => {
  console.log(`Server is running on port ${port}`);
});
