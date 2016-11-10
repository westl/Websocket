var myApp = angular.module('myApp', ['ngMaterial'])
    .controller("mainController", function($scope, $timeout, $filter, $mdSidenav, $mdToast) {
        //UI related things
        $scope.openLeftMenu = function() {
            $mdSidenav('left').toggle();
        };
        //the main controller that will handle chatting
        $scope.main = this;
        this.notifications = 0;
        this.userName = "unknown";
        this.notifiedServiceOfTyping = false; // if we already sent the server a message that we are
        this.maxCharacters = 5000;
        this.handle = {
            messages: [],
            peopleTyping: [],
            colors: {},
            peopleConnected: {},
        };
        //Socket listeners
        this.socket = io();

        //when someone new connects, give them the current chat log
        this.socket.on("connection", (data) => {
            $scope.$apply(() => {
                this.handle.messages = data.messages;
                this.handle.peopleTyping = data.peopleTyping;
                this.handle.peopleConnected = data.peopleConnected;
                //remove self from array of people typing in any given scenario
                var index = this.handle.peopleTyping.indexOf(this.userName);
                if (index > -1)
                    this.handle.peopleTyping.splice(index, 1);
            });

            //user is completely new to application give each username in the chat a new color
            this.generateColorObject();
        });

        //When message received from server, push it to the current chat log
        this.socket.on('logged in', (userName) => {
            $scope.$apply(() => {
                this.userName = userName;
                this.handle.colors[this.userName] = 'black';
            });
            this.setScrollBar();
        });

        //When someone new connects to the room
        this.socket.on('user connected', (data) => {
            this.notifications++;
            var toast = $mdToast.simple();
            var userName = data.userName;
            toast.textContent(`${userName} connected!`);
            $mdToast.show(toast);
            $scope.$apply(() => {
                this.handle.peopleConnected = data.peopleConnected;
            });
            this.setScrollBar();
        });

        //When someone disconnects from the room
        this.socket.on('user disconnected', (data) => {
            var toast = $mdToast.simple();
            var userName = data.userName;
            toast.textContent(`${userName} disconnected!`);
            $mdToast.show(toast);
            $scope.$apply(() => {
                this.handle.peopleConnected = data.peopleConnected;
            });
            this.setScrollBar();
        });

        this.socket.on('typing activity updated', (listOfPeopleTyping) => {
            $scope.$apply(() => {
                this.handle.peopleTyping = listOfPeopleTyping; // simply usernames
                //remove self from array
                var index = this.handle.peopleTyping.indexOf(this.userName);
                if (index > -1)
                    this.handle.peopleTyping.splice(index, 1);
            });
        });

        //When message received from server, push it to the current chat log
        this.socket.on('message received', (data) => {
            $scope.$apply(() => {
                this.handle.messages.push(data.message);
                this.handle.peopleConnected = data.peopleConnected; //updates their counts
            });

            //just for speeds sake, if the username exists in the color object, lets not generate a  new color for them.
            if (!this.existsInColorObject(data.message.userName)) {
                this.generateColorObject();
            }

            this.setScrollBar();
        });
        //End of socket listeners


        //Let the server know you're typing and to shoot this off to all other clients
        this.imTyping = () => {
            if (this.message && !this.notifiedServiceOfTyping) {
                this.socket.emit('im typing', this.userName);
                //stops subsequent calls to the service if we already let it know that we're typing
                this.notifiedServiceOfTyping = true;
            } else if (!this.message) {
                this.socket.emit('im no longer typing', this.userName);
                this.notifiedServiceOfTyping = false;
            }
        };

        //Sends the message to the server
        this.sendMessage = (keyEvent, text) => {
            //submit
            if (keyEvent.which === 13 || keyEvent === 'clicked') {
                //check to see if the message is valid
                if (text && text.length < this.maxCharacters) {
                    var message = {
                        userName: this.userName,
                        content: text,
                        timeStamp: new Date()
                    };
                    this.socket.emit('message sent', message); //implies that you're no longer typing also
                    this.socket.emit('im no longer typing', this.userName);
                    this.setScrollBar();
                }
                //erase message whether message is invalid or not
                this.message = '';
                this.notifiedServiceOfTyping = false;
            }
        };

        //helper function to set the scrollbar always ta the bottom of its height
        this.setScrollBar = () => {
            $timeout(function() {
                var scroller = angular.element(document).find(".chat-container")[0];
                scroller.scrollTop = scroller.scrollHeight;
            }, 0, false);
        };

        this.existsInColorObject = (userName) => {
            return this.handle.colors[userName];
        };

        this.generateColorObject = () => {
            for (let messageObject of this.handle.messages) {

                //if a username exists, it probably already has a color, therefore, continue
                if (!this.existsInColorObject(messageObject.userName)) {
                    this.handle.colors[messageObject.userName] = '#' + Math.floor(Math.random() * 16777215).toString(16);
                }
            }
        };


    });
