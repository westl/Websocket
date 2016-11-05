'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);
//Create the Message class that will exist on the server
var Message = function(content) {
    this.content = content;
    this.timeStamp = new Date().toDateString();
};

//Create Array that will hold messages on the server side
var messageArray = [];
//on connected, send all messages stored
io.on('connection', (socket) => {
    socket.emit('connection', messageArray);

    socket.on('message sent', (message) => {
        messageArray.push(message);
        io.emit('message received', message); // each listener receives this .
    });

    socket.on('disconnect', () => {
        io.emit('user disconnected');
        console.log('user disconnected');
    });
});
