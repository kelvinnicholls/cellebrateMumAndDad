import { EventEmitter } from "@angular/core";
import { Consts } from "../shared/consts";
//https://stackoverflow.com/questions/37090031/how-to-import-socket-io-client-in-a-angular-2-application
import * as io from "socket.io-client";

export class ChatService {
    public chatUsers: string[];
    public chatUserMessages: string[];
    socket: any;
    constructor() {
        this.socket = io(Consts.API_URL_ROOT);
    }
}