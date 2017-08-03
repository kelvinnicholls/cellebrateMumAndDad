import { Routes, RouterModule } from "@angular/router";


import { AuthGuard } from '../auth/auth-guard.service';

import { ChatSendMessageComponent } from "./chat-send-message/chat-send-message.component";

const CHAT_ROUTES: Routes = [
  { path: 'chat', component: ChatSendMessageComponent, canActivate: [AuthGuard] },
  { path: 'chat/:socketId', component: ChatSendMessageComponent, canActivate: [AuthGuard] }
 ];

export const chatRouting = RouterModule.forChild(CHAT_ROUTES);