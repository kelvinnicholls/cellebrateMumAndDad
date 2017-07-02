import { Routes, RouterModule } from "@angular/router";

import { UsersComponent } from "./users/users.component";
import { UserInputComponent } from "./users/user-input.component";
import { ChangePasswordComponent } from "./users/change-password/change-password.component";
import { HomeComponent } from "./home.component";
import { PageNotFoundComponent } from "./pagenotfound/pagenotfound.component";
import { SignInComponent } from "./auth/sign-in.component";
import { GetEncryptedPasswordComponent } from "./auth/get-encrypted-password.component";
import { AuthGuard } from './auth/auth-guard.service';


const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'user/change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'user/edit-me', component: UserInputComponent, canActivate: [AuthGuard] },
  { path: 'auth/sign-in', component: SignInComponent },
  { path: 'auth/get-encrypted-password', component: GetEncryptedPasswordComponent, canActivate: [AuthGuard] },
  { path: 'not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/not-found' }
];

export const routing = RouterModule.forRoot(APP_ROUTES);