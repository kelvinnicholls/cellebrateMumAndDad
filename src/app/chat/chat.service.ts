import { EventEmitter, Injectable } from "@angular/core";
import * as moment from 'moment';
import { ChatMessage } from "./chat-message.model";
import { ChatUser } from "./chat-user.model";
import { AuthUserService } from "../auth/auth-user.service";

import { Consts } from "../shared/consts";
//https://stackoverflow.com/questions/37090031/how-to-import-socket-io-client-in-a-angular-2-application
import * as io from "socket.io-client";

@Injectable()
export class ChatService {
    public chatUsers: ChatUser[] = [];
    public chatUserMessages: ChatMessage[] = [];
    socket: any;
    name: string = "";
    public geolocationSupported = false;

    location = { latitude: 0, longitude: 0 };

    clearMessages() {
        this.chatUserMessages = [];
    }

    removeMessage(index) {
        this.chatUserMessages.splice(index, 1);
    };

    setPosition(position) {
        this.location = position.coords;
        console.log(position.coords);
    }

    findChatUser(socketId: any): ChatUser {
        return this.chatUsers.find((chatUser: ChatUser) => {
            return chatUser.id === socketId;
        });
    }

    addSocketCallbacks() {
        this.socket.removeAllListeners();
        this.socket.on('newMessage', (msg) => {
            let formattedDate = moment(msg.createdAt).format('h:mm a');
            let text = null;
            let url = null;
            if (msg.text) {
                text = msg.text;
            };
            if (msg.url) {
                url = msg.url;
            };
            let chatMessage = new ChatMessage(text, new ChatUser(msg.from.id, msg.from.name), formattedDate, url);
            this.chatUserMessages.push(chatMessage);
        });

        // this.socket.on('addUser', (user) => {
        //     this.chatUsers.push(new ChatUser(user.id, user.name));
        // });

        // this.socket.on('removeUser', (user) => {
        //     this.chatUsers.splice(this.chatUsers.indexOf(new ChatUser(user.id, user.name)), 1);
        // });

        this.socket.on('connect', () => {
            console.log("Connected to server");
        });

        this.socket.on('disconnect', () => {
            console.log("Disconnected from server");
        });

        this.socket.on('updateUserList', (users) => {
            let socketId = this.socket.io.engine.id;
            console.log('updateUserList', users);
            let chatUsers: ChatUser[] = [];
            users.forEach(function (user) {
                if (user.id != socketId) {
                    chatUsers.push(new ChatUser(user.id, user.name));
                }
            });
            this.chatUsers = chatUsers;
        });

    }

    public connect(name: string) {
        this.name = name;
        this.socket = io(Consts.API_URL_ROOT);
        this.addSocketCallbacks();
        this.socket.emit('join', this.name, function (err) {
            if (err) {
                console.log("join Error", err);
                // alert(err);
                // window.location.href = '/';
            } else {
                console.log("join No Error");
            }
        });
    }

    public logOut() {
        this.socket.emit('logOut');
        this.socket = null;
        this.chatUsers = [];
        this.chatUserMessages = [];
    }



    public createMessage(text: string, sendAsAdmin: boolean, socketId: any, callback) {
        this.socket.emit('createMessage', this.generateMessage(text, sendAsAdmin, socketId), callback)
    }

    public createLocationMessage(socketId: any, callback) {
        navigator.geolocation.getCurrentPosition(this.setPosition.bind(this));

        this.socket.emit('createLocationMessage', {
            latitude: this.location.latitude,
            longitude: this.location.longitude,
            socketId: socketId
        }, callback);
    }



    public showName(name) {
        // add to user list
    }

    public generateMessage = function (text, sendAsAdmin, socketId) {
        return {
            text,
            socketId,
            sendAsAdmin
        };
    };

    constructor(public authUserService: AuthUserService) {

        if (this.authUserService.isLoggedIn()) {
            this.connect(this.authUserService.getLoggedInUserName());
        }
        // let chatMessage1 = new ChatMessage("1 Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Sed posuere consectetur est at lobortis. Cras mattis consectetur purus sit amet fermentum", "Kelvin", "August 5th 2017");
        // let chatMessage2 = new ChatMessage("2 Etiam porta sem malesuada magna mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.", "Sharon", "August 5th 2017");
        // let chatMessage3 = new ChatMessage("3 Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.", "Kelvin", "August 5th 2017");
        // this.chatUserMessages.push(chatMessage1);
        // this.chatUserMessages.push(chatMessage2);
        // this.chatUserMessages.push(chatMessage3);

        if (this.socket) {
            this.addSocketCallbacks();
        };


        if (navigator.geolocation) {
            this.geolocationSupported = true;
        };
    }

}


// $('#msg-form').on('submit', function (e) {
//     e.preventDefault();
//     socket.emit('createMessage', (generateMessage(socket.id, msgTextBox.val())), function (msg) {
//         msgTextBox.val('');
//     });
// })



// sendLocationButton.on('click', function () {
//     if (!navigator.geolocation) {
//         return alert("Geolocation not supported by your browser");
//     }
//     sendLocationButton.attr('disabled', 'disabled').text('Sending Location...');
//     navigator.geolocation.getCurrentPosition(function (position) {
//         sendLocationButton.removeAttr('disabled').text('Send Location');
//         socket.emit('CreateLocationMessage', {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude
//         })
//     }, function () {
//         alert("Unable to fetch location");
//         sendLocationButton.removeAttr('disabled').text('Send Location');
//         msgTextBox.val('');
//     });
// });

// socket.on('newLocationMessage', function (msg) {
//     // console.log("New Location Message", msg);
//     // let formattedDate = moment().format('h:mm a');
//     // let li = $('<li></li>');
//     // let a = $('<a target="_blank">My Current Location<\a>');
//     // li.text(`${msg.from}: ${formattedDate} `);
//     // a.attr('href', msg.url);
//     // li.append(a);
//     // $('#messages').append(li);



//     let formattedDate = moment(msg.createdAt).format('h:mm a');
//     let template = $('#location-message-template').html();
//     let html = Mustache.render(template, {
//         url: msg.url,
//         from: msg.from,
//         createdAt: formattedDate
//     });
//     $('#messages').append(html);

//     scrollToBottom();
// });