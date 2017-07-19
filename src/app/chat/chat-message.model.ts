import { ChatUser } from "./chat-user.model";
export class ChatMessage {
    constructor(public text: string, public from: ChatUser, public createdAt: string, public url:string) { }
}
