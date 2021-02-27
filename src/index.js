const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3031;
const publicPath = path.join(__dirname, '../public/');

app.use(express.json());
app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New web socket connection.');

    socket.emit('message','Welcome.');
    socket.broadcast.emit('message','A new user has joined.');

    socket.on('sendMessage', (msg, cb) => {
        const filt = new filter();

        if(filt.isProfane(msg)){
            return cb(msg);
        }

        io.emit('message', msg);
        cb();
    });

    socket.on('shareLocation',(position,cb) => {
        io.emit('shareLocation', `https://google.com/map?q=${position.latitude},${position.longitude}`);
        cb();
    })

    socket.on('sendRating',(rate,cb) => {
        if(isNaN(parseInt(rate)) || parseInt(rate) < 0 || parseInt(rate) > 5){
            return cb(rate);
        }
        io.emit('rating',rate);
        cb();
    })

    socket.on('disconnect', () => {
        io.emit('message','A user has left.');
    })
})
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
})