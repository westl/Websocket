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
    var message = {
        content: "Hello World",
        timeStamp: new Date().toDateString()
    };

    var interval = setInterval(() => {
        socket.emit('send message', message)
    }, 3000);

    socket.on('disconnect', () => {
        io.emit('user disconnected');
        clearInterval = interval;
    });
    /*io.emit("connection", messageArray); //received by everyone

    socket.on('sendMessage', (message) => {
        console.log("message received from ui : ", message);
          var message = new Message();
          message.content = message;
          messageArray.push(message);
        socket.emit('messageSent', message);
    });

    socket.on('disconnect', () => {
      io.emite('user disconnected');
    });*/
});
