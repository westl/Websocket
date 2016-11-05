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
console.log("SERVER STARTEd");
//Create Array that will hold messages on the server side
var messageArray = [];

//on connected, send all messages stored
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.emit("connection", messageArray);
    console.log("STARTING MESSAGING");
    socket.on('sendMessage', (message) => {
        console.log("message received : ", message);
        var message = new Message();
        message.content = message;
        messageArray.push(message);
        //io.sockets.emit('messageSent', () => console.log("Someone sent a msg!"));
    });
    console.log("STARTING DISCONNECT");
    socket.on('disconnect', () => console.log('Client disconnected'));
});

//whenever a message is added, push that to the array and display
