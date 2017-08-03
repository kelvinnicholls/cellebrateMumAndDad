import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { ChatUsersComponent } from "./chat-users/chat-users.component";
import { ChatMessagesListComponent } from "./chat-messages-list/chat-messages-list.component";
import { ChatMessageComponent } from "./chat-messages-list/chat-message/chat-message.component";
import { ChatSendMessageComponent } from "./chat-send-message/chat-send-message.component";
import { SharedModule } from "../shared/shared.module";
import { chatRouting } from "./chat.routing";


@NgModule({
    declarations: [
        ChatUsersComponent,
        ChatMessagesListComponent,
        ChatMessageComponent,
        ChatSendMessageComponent      
    ],
    exports: [ChatUsersComponent,ChatMessagesListComponent],
    imports: [CommonModule,
        ReactiveFormsModule,
        chatRouting,
        SharedModule],
    providers: [],
    bootstrap: []
})

export class ChatModule {

}