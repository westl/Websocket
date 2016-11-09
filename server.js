'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const Moniker = require('moniker');
const PORT = process.env.PORT || 3000;
const server = express()
    .use(express.static(path.join(__dirname, 'public')))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);
//Create Array that will hold messages on the server side
var messageArray = [];
//Create array the will hold everyone who is currently typing
var currentlyTyping = [];
//on connected, send all messages stored and give the user a random username
io.on('connection', (socket) => {
    //pass each user the chat log
    socket.emit('connection', {
        "messages": messageArray,
        "peopleTyping": currentlyTyping
    });

    var userName = Moniker.choose();
    //give each user a username
    socket.emit('logged in', userName);

    socket.on('im typing', (userName) => {
        currentlyTyping.push(userName);
        io.emit('typing activity updated', currentlyTyping);
    });

    socket.on('im no longer typing', (userName) => {
        //check if person exists in the array
        currentlyTyping = this.removeFromArray(userName, currentlyTyping);
        io.emit('typing activity updated', currentlyTyping);
    });

    socket.on('message sent', (message) => {
        messageArray.push(message);
        io.emit('message received', message); // each listener receives this .
    });

    socket.on('disconnect', () => {
        io.emit('user disconnected');
    });
});

//Helper functions
this.removeFromArray = (item, array) => {
    var index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
};
