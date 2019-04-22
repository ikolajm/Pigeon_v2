require('dotenv').config()
const app = require('express')();
const http = require('http').Server(app);
const io = module.exports.io = require('socket.io')(http);

const SocketManager = require('./SocketManager');

io.on('connection', SocketManager);

app.use( express.static(__dirname + '../../build'))

http.listen(3001, () => {
    console.log('Server is running');
});