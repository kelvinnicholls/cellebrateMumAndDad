import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home.component";
import { AuthGuard } from './auth/auth-guard.service';

const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent, data : {animation : {page : 'home'}} },
  { path: 'users', loadChildren: './users/users.module#UsersModule', canLoad: [AuthGuard], data : {animation : {page : 'users'}}  },
  { path: 'photos', loadChildren: './photos/photos.module#PhotosModule', canLoad: [AuthGuard], data : {animation : {page : 'photos'}}  },
  { path: 'memories', loadChildren: './memories/memories.module#MemoriesModule', canLoad: [AuthGuard], data : {animation : {page : 'memories'}}  },
  { path: 'auth', loadChildren: './auth/auth.module#AuthModule', canLoad: [AuthGuard], data : {animation : {page : 'auth'}} },
  { path: '**', redirectTo: '/not-found' }
];

export const appRouting = RouterModule.forRoot(APP_ROUTES);