import { EventEmitter } from "@angular/core";
import * as moment from 'moment';
import { ChatMessage } from "./chat-message.model";


import { Consts } from "../shared/consts";
//https://stackoverflow.com/questions/37090031/how-to-import-socket-io-client-in-a-angular-2-application
import * as io from "socket.io-client";

export class ChatService {
    public chatUsers: string[] = new Array();
    public chatUserMessages: ChatMessage[] = new Array();
    socket: any;


    addSocketCallbacks() {
        this.socket.on('newMessage', function (msg) {
            let formattedDate = moment(msg.createdAt).format('h:mm a');
            let chatMessage = new ChatMessage(msg.text, msg.from, formattedDate);
            this.chatUserMessages.push(chatMessage);
        });

        this.socket.on('addUser', function (userName) {
            this.chatUsers.push(userName);
        });

        this.socket.on('removeUser', function (userName) {
            this.chatUsers.splice(this.users.indexOf(userName), 1);
        })
    }

    public connect() {
        this.socket = io(Consts.API_URL_ROOT);
        this.addSocketCallbacks();
    }

    public disconnect() {
        this.socket = null;
    }

    public createMessage(from: string, text: string) {
        this.socket.emit('createMessage', {
            from,
            text
        });
    }

    constructor() {
        let chatMessage1 = new ChatMessage("Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Sed posuere consectetur est at lobortis. Cras mattis consectetur purus sit amet fermentum", "Kelvin", "August 5th 2017");
        let chatMessage2 = new ChatMessage("Etiam porta sem malesuada magna mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.", "Sharon", "August 5th 2017");
        let chatMessage3 = new ChatMessage("Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.", "Kelvin", "August 5th 2017");
        this.chatUserMessages.push(chatMessage1);
        this.chatUserMessages.push(chatMessage2);
        this.chatUserMessages.push(chatMessage3);

        let user1 = "Kelvin";
        let user2 = "Sharon";
        let user3 = "Geoffrey";
        this.chatUsers.push(user1);
        this.chatUsers.push(user2);
        this.chatUsers.push(user3);

        if (this.socket) {
            this.addSocketCallbacks();
        }
    }
}

// socket.on('newMessage', function (msg) {
//     let formattedDate = moment(msg.createdAt).format('h:mm a');
//     // console.log("New Message", msg);
//     // let li = $('<li></li>');
//     // li.text(`${msg.from} ${formattedDate}: ${msg.text}`);
//     // $('#messages').append(li);
//     let template = $('#message-template').html();
//     let html = Mustache.render(template, {
//         text: msg.text,
//         from: msg.from,
//         createdAt: formattedDate
//     });
//     $('#messages').append(html);
//     scrollToBottom();
// });

// let socket = io(); // initiates request

// function scrollToBottom() {
//     // Selectors
//     let messages = $('#messages');
//     let newMessage = messages.children('li:last-child');


//     //Heights

//     let clientHeight = messages.prop('clientHeight');
//     let scrollTop = messages.prop('scrollTop');
//     let scrollHeight = messages.prop('scrollHeight');
//     let newMessageHeight = newMessage.innerHeight();
//     let lastMessageHeight = newMessage.prev().innerHeight();

//     if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
//         messages.scrollTop(scrollHeight);
//     }
// };

// socket.on('connect', function () {
//     console.log("Connected to server");
//     let params = $.deparam(window.location.search);
//     socket.emit('join', params, function (err) {
//         if (err) {
//             alert(err);
//             window.location.href = '/';
//         } else {
//             console.log("No Error");
//         }
//     });

//     // socket.emit('createEmail',{
//     //     from: 'kelv@kelv.com',
//     //     text: "Hey up",
//     //     createdAt: 13355
//     // })
// });

// socket.on('disconnect', function () {
//     console.log("Disconnected from server");
// });

// // socket.on('newEmail', function (email) {
// //     console.log("New Email",email);
// // });


// // function showName(name) {
// //     let template = $('#people-template').html();
// //     let html = Mustache.render(template, {
// //         name: name
// //     });
// //     $('#users').append(html);
// // }

// socket.on('updateUserList', function (users, user) {
//     console.log('newUser',users,user);

//     let ol = $('<ol></ol>')

//     if (users) {
//         users.forEach(function (user) {
//             ol.append($('<li></li>').text(user));
//         });
//         $('#users').html(ol);
//     };

// });

// // socket.emit('createMessage', (generateMessage('John', 'Hi There!')), function (msg) {
// //     console.log("Got it", msg);
// // });

// // socket.emit('createMessage', {
// //     from: "Bob",
// //     text: "How Do"
// // });

// let msgTextBox = $('[name=message]');
// let sendLocationButton = $('#sendlocation');


// let generateMessage = function (from, text) {
//     return {
//         from,
//         text,
//         createdAt: moment().valueOf()
//     };
// };


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