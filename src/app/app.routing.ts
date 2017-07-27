import { Routes, RouterModule } from "@angular/router";

import { UserListComponent } from "./users/user-list.component";
import { UserInputComponent } from "./users/user-input.component";
import { ChangePasswordComponent } from "./users/change-password/change-password.component";
import { HomeComponent } from "./home.component";
import { PageNotFoundComponent } from "./pagenotfound/pagenotfound.component";
import { SignInComponent } from "./auth/sign-in.component";
import { GetEncryptedPasswordComponent } from "./auth/get-encrypted-password.component";
import { AuthGuard } from './auth/auth-guard.service';
import { ChatSendMessageComponent } from "./chat/chat-send-message/chat-send-message.component";

const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'users', component: UserListComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatSendMessageComponent, canActivate: [AuthGuard] },
  { path: 'chat/:socketId', component: ChatSendMessageComponent, canActivate: [AuthGuard] },
  { path: 'user/change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'user/edit-me', component: UserInputComponent, canActivate: [AuthGuard] },
  { path: 'user/create', component: UserInputComponent, canActivate: [AuthGuard] },
  { path: 'user/:index', component: UserInputComponent, canActivate: [AuthGuard] },
  { path: 'auth/sign-in', component: SignInComponent },
  { path: 'auth/get-encrypted-password', component: GetEncryptedPasswordComponent, canActivate: [AuthGuard] },
  { path: 'not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/not-found' }
];

export const routing = RouterModule.forRoot(APP_ROUTES);