import { Routes, RouterModule } from "@angular/router";

import { UserListComponent } from "./user-list.component";
import { UserInputComponent } from "./user-input.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { AuthGuard } from '../auth/auth-guard.service';
const USERS_ROUTES: Routes = [
  { path: '', component: UserListComponent, canActivate: [AuthGuard] },
  { path: 'user/change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'user/edit-me', component: UserInputComponent, canActivate: [AuthGuard] },
  { path: 'user/create', component: UserInputComponent, canActivate: [AuthGuard] },
  { path: 'user/:index', component: UserInputComponent, canActivate: [AuthGuard] }
 ];


export const usersRouting = RouterModule.forChild(USERS_ROUTES);