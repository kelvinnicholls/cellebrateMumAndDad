import { Routes, RouterModule } from "@angular/router";

import { PhotoListComponent } from "./photo-list.component";
import { PhotoInputComponent } from "./photo-input.component";
import { AuthGuard } from '../auth/auth-guard.service';
const USERS_ROUTES: Routes = [
  { path: '', component: PhotoListComponent, canActivate: [AuthGuard], pathMatch: 'full' },
  { path: 'photo/add', component: PhotoInputComponent, canActivate: [AuthGuard] },
  { path: 'photo/edit/:index', component: PhotoInputComponent, canActivate: [AuthGuard] },
  { path: 'photo/view/:index', component: PhotoInputComponent, canActivate: [AuthGuard] }
];


export const photosRouting = RouterModule.forChild(USERS_ROUTES);