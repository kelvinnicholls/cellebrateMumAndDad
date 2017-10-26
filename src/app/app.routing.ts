import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home.component";
import { AuthGuard } from './auth/auth-guard.service';

const APP_ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'users', loadChildren: './users/users.module#UsersModule', canLoad: [AuthGuard]  },
  { path: 'photos', loadChildren: './photos/photos.module#PhotosModule', canLoad: [AuthGuard]  },
  { path: 'memories', loadChildren: './memories/memories.module#MemoriesModule', canLoad: [AuthGuard]  },
  { path: 'auth', loadChildren: './auth/auth.module#AuthModule', canLoad: [AuthGuard] },
  { path: '**', redirectTo: '/not-found' }
];

export const appRouting = RouterModule.forRoot(APP_ROUTES);