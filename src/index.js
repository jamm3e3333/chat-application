const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3031;
const publicPath = path.join(__dirname, '../public/');

app.use(express.json());
app.use(express.static(publicPath));


io.on('connection', () => {
    console.log('New web socket connection.');
})
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
})