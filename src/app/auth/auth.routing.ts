import { Routes, RouterModule } from "@angular/router";

import { SignInComponent } from "./sign-in.component";
import { GetEncryptedPasswordComponent } from "./get-encrypted-password.component";
import { AuthGuard } from './auth-guard.service';

const AUTH_ROUTES: Routes = [
  { path: 'auth/sign-in', component: SignInComponent },
  { path: 'auth/get-encrypted-password', component: GetEncryptedPasswordComponent, canActivate: [AuthGuard] },
 ];

export const authRouting = RouterModule.forChild(AUTH_ROUTES);