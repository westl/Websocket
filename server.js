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

//Person constructor
function Person(userName, messageCount) {
    this.userName = userName;
    this.messageCount = messageCount;
}
//Create Array that will hold messages on the server side
var messageArray = [];
//Create array the will hold everyone who is currently typing
var currentlyTyping = [];
//Create array that will hold users
var people = [];
//on connected, send all messages stored and give the user a random username
io.on('connection', (socket) => {

    var newPerson = new Person(Moniker.choose(), 0);
    people.push(newPerson);
    //pass them the chat log
    socket.emit('connection', {
        "messages": messageArray,
        "peopleTyping": currentlyTyping,
        "peopleConnected": people,
    });

    //pass their client their user name
    socket.emit('logged in', newPerson.userName);

    //tell everyone of their new username and that they connected, also send them a list of everyone connected
    io.emit('user connected', {
        userName: newPerson.userName,
        peopleConnected: people,
    });


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
        var indexOfUser = this.getUserIndex(message.userName, people);
        var temp = people[indexOfUser];
        if (indexOfUser > -1)
            people[indexOfUser].messageCount++;
        //Send the message and an updated list of people to everyone
        io.emit('message received', {
            message: message,
            peopleConnected: people,
        });
    });

    socket.on('disconnect', () => {
        //remove them from people connected array
        var indexToRemove = this.getUserIndex(newPerson.userName, people);
        if (indexToRemove > -1)
            people.splice(indexToRemove, 1);
        //let everyone know they just disconnected
        io.emit('user disconnected', {
            userName: newPerson.userName,
            peopleConnected: people,
        });
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

this.getUserIndex = (nameToLookFor, array) => {
    var i = 0,
        len = array.length;
    for (; i < len; i++) {
        if (array[i].userName == nameToLookFor) {
            return i;
        }
    }
    return -1;
};
