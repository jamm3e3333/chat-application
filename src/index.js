const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const filter = require('bad-words');
const {generateMessage, generateLocMessage} = require('./utils/messages.js');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3031;
const publicPath = path.join(__dirname, '../public/');

app.use(express.json());
app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New web socket connection.');

    socket.emit('message',generateMessage('Welcome'));
    socket.broadcast.emit('message',generateMessage('New user has joined.'));

    socket.on('sendMessage', (msg, cb) => {
        const filt = new filter();

        if(filt.isProfane(msg)){
            return cb(msg);
        }

        io.emit('message', generateMessage(msg));
        cb();
    });

    socket.on('shareLocation',(position,cb) => {
        io.emit('shareLocation', generateLocMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`));
        cb();
    })
    
    socket.on('disconnect', () => {
        io.emit('message',generateMessage('User has left.'));
    })
})
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
})