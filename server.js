'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const Moniker = require('moniker');
const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');
const server = express()
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);
//Create Array that will hold messages on the server side
var messageArray = [];
//on connected, send all messages stored and give the user a random username
io.on('connection', (socket) => {
    //pass each user the chat log
    socket.emit('connection', messageArray);

    var userName = Moniker.choose();
    //give each user a username
    socket.emit('logged in', userName);


    socket.on('message sent', (message) => {
        messageArray.push(message);
        io.emit('message received', message); // each listener receives this .
    });

    socket.on('disconnect', () => {
        io.emit('user disconnected');
    });
});
