import { EventEmitter, Injectable } from "@angular/core";
import * as moment from 'moment';
import { ChatMessage } from "./chat-message.model";
import { ChatUser } from "./chat-user.model";
import { AuthUserService } from "../auth/auth-user.service";
import { UserService } from "../users/user.service";
import { PhotoService } from "../photos/photo.service";
import { MemoryService } from "../memories/memory.service";
import { TagService } from "../shared/tags/tag.service";
import { PersonService } from "../shared/people/person.service";
import { Utils, SortDataType, LoglevelEnum } from "../shared/utils/utils";
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
        this.chatUserMessages.sort(Utils.dynamicSort('-createdAt',SortDataType.Moment,Consts.CHAT_DATE_FORMAT));
    };

    setPosition(position, socketId, callback) {
        this.location = position.coords;
        this.socket.emit('createLocationMessage', {
            latitude: this.location.latitude,
            longitude: this.location.longitude,
            socketId: socketId
        }, callback);
        Utils.log(LoglevelEnum.Info,this,position.coords);
    }

    findChatUser(socketId: any): ChatUser {
        return this.chatUsers.find((chatUser: ChatUser) => {
            return chatUser.id === socketId;
        });
    }

    addSocketCallbacks() {
        this.socket.removeAllListeners();
        this.socket.on('newMessage', (msg) => {
            let formattedDate = moment(msg.createdAt).format(Consts.CHAT_DATE_FORMAT);
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
            this.chatUserMessages.sort(Utils.dynamicSort('-createdAt',SortDataType.Moment,Consts.CHAT_DATE_FORMAT));
        });

        // this.socket.on('addUser', (user) => {
        //     this.chatUsers.push(new ChatUser(user.id, user.name));
        // });

        // this.socket.on('removeUser', (user) => {
        //     this.chatUsers.splice(this.chatUsers.indexOf(new ChatUser(user.id, user.name)), 1);
        // });

        this.socket.on('connect', () => {
            Utils.log(LoglevelEnum.Info,this,"Connected to server");
        });

        this.socket.on('disconnect', () => {
            Utils.log(LoglevelEnum.Info,this,"Disconnected from server");
        });

        this.socket.on('updateUserList', (users) => {
            if (this.socket && this.socket.io) {
                let socketId = this.socket.io.engine.id;
                Utils.log(LoglevelEnum.Info,this,'updateUserList', users);
                let chatUsers: ChatUser[] = [];
                users.forEach(function (user) {
                    if (user.id != socketId) {
                        chatUsers.push(new ChatUser(user.id, user.name));
                    }
                });
                this.chatUsers = chatUsers;
            }
        });


        this.userService.addCallbacks(this.socket);
        this.photoService.addCallbacks(this.socket);
        this.tagService.addCallbacks(this.socket);
        this.personService.addCallbacks(this.socket);
        this.memoryService.addCallbacks(this.socket);
    }


    public connect(name: string) {
        this.name = name;
        this.socket = io(Consts.API_URL_ROOT);
        this.addSocketCallbacks();
        this.socket.emit('join', this.name, function (err) {
            if (err) {
                Utils.log(LoglevelEnum.Info,this,"join Error", err);
                // alert(err);
                // window.location.href = '/';
            } else {
                Utils.log(LoglevelEnum.Info,this,"join No Error");
            }
        });
    }

    public logOut() {
        this.socket.emit('logOut');
        this.socket.removeAllListeners();
        this.socket = null;
        this.chatUsers = [];
        this.chatUserMessages = [];
    }



    public createMessage(text: string, sendAsAdmin: boolean, socketId: any, callback) {
        this.socket.emit('createMessage', this.generateMessage(text, sendAsAdmin, socketId), callback)
    }

    public createLocationMessage(socketId: any, callback) {
        navigator.geolocation.getCurrentPosition((position) => {
            this.setPosition(position, socketId, callback);
        }, () => {
            Utils.log(LoglevelEnum.Info,this,"There was an error getting position");
        });


    }


    public generateMessage = function (text, sendAsAdmin, socketId) {
        return {
            text,
            socketId,
            sendAsAdmin
        };
    };

    constructor(public authUserService: AuthUserService
        , public userService: UserService
        , public memoryService: MemoryService
        , public photoService: PhotoService
        , public tagService: TagService
        , public personService: PersonService) {

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