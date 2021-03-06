const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const filter = require('bad-words');
const {generateMessage, generateLocMessage} = require('./utils/messages.js');
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3031;
const publicPath = path.join(__dirname, '../public/');

app.use(express.json());
app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New web socket connection.');

    socket.on('join', ({username, room },cb) => {
        const {error, user} = addUser({id: socket.id, username, room})
        console.log(user);
        if(error){
            return cb(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage('server','Welcome'));
        socket.broadcast.to(user.room).emit('message',generateMessage('server',`${user.username} has entered the room ${user.room}.`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        cb();
    })

    socket.on('sendMessage', (msg, cb) => {
        const filt = new filter();
        const user = getUser(socket.id);
        if(filt.isProfane(msg)){
            return cb(msg);
        }

        io.to(user.room).emit('message', generateMessage(user.username,msg));
        cb();
    });

    socket.on('shareLocation',(position,cb) => {
         const user = getUser(socket.id);
         console.log(user.username)
        io.to(user.room).emit('shareLocation', generateLocMessage(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`));
        cb(user);
    })
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',generateMessage('server',`${user.username} has left the room ${user.room}`));
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
})