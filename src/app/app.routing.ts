import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home.component";
import { AuthGuard } from './auth/auth-guard.service';

const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '/not-found' }
];

export const appRouting = RouterModule.forRoot(APP_ROUTES);