const express = require('express')
const cors = require('cors')
const http = require('http');
const { Server } = require('socket.io')
const app = express()
const router = require('./router');
const { addUser, findUser, getRoomUsers, removeUser } = require('./users');


app.use(cors({ origin: "*" }))
app.use(router)

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    console.log("Connect")
    socket.on("join", ({ name, room }) => {
        socket.join(room)

        const {user, isExsist} = addUser({name, room})
        
        const userMessage = isExsist ? `${user.name} снова с нами!` : `${user.name} добро пожаловать!`

        socket.emit("getMessage", {
            user: {name: "Admin"}, message: userMessage
        })
        socket.broadcast.to(user.room).emit("getMessage", {
            user: {name: `${user.name}`}, message: userMessage
        })

        io.to(user.room).emit("room", {
            data: { users: getRoomUsers(user.room) },
        });
      

    })

    socket.on("sendMessage", ({ message, params }) => {
        const user = findUser(params)
        console.log('user', user)
        if(user) {
            io.to(user.room).emit("getMessage", { user, message })
        }
    })

    socket.on("leftRoom", ({ params }) => {
        const user = removeUser(params);
    
        if (user) {
            const { room, name } = user;
    
        io.to(room).emit("getMessage", {
            user: { name: "Admin" }, message: `${name} покинул комнату`
        });
    
        io.to(room).emit("room", {
            data: { users: getRoomUsers(room) },
        });
        }
    });
    io.on("disconnect", () => {
        console.log("Disconnect")
    })
})

const PORT = 5000   
server.listen(PORT, () => {
    console.log("Server running")
})