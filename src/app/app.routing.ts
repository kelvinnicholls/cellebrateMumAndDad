import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home.component";
import { PageNotFoundComponent } from "./pagenotfound/pagenotfound.component";
import { SignInComponent } from "./auth/sign-in.component";
import { GetEncryptedPasswordComponent } from "./auth/get-encrypted-password.component";
import { AuthGuard } from './auth/auth-guard.service';
import { ChatSendMessageComponent } from "./chat/chat-send-message/chat-send-message.component";

const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'chat', component: ChatSendMessageComponent, canActivate: [AuthGuard] },
  { path: 'chat/:socketId', component: ChatSendMessageComponent, canActivate: [AuthGuard] },
  { path: 'auth/sign-in', component: SignInComponent },
  { path: 'auth/get-encrypted-password', component: GetEncryptedPasswordComponent, canActivate: [AuthGuard] },
  { path: 'not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/not-found' }
];

export const appRouting = RouterModule.forRoot(APP_ROUTES);