import { Routes, RouterModule } from "@angular/router";

import { MemoryListComponent } from "./memory-list.component";
import { MemoryInputComponent } from "./memory-input.component";
import { AuthGuard } from '../auth/auth-guard.service';
const USERS_ROUTES: Routes = [
  { path: '', component: MemoryListComponent, canActivate: [AuthGuard], pathMatch: 'full' },
  { path: 'memory/add', component: MemoryInputComponent, canActivate: [AuthGuard] },
  { path: 'memory/view/:index', component: MemoryInputComponent, canActivate: [AuthGuard] },
  { path: 'memory/edit/:index', component: MemoryInputComponent, canActivate: [AuthGuard] }
];


export const memoriesRouting = RouterModule.forChild(USERS_ROUTES);