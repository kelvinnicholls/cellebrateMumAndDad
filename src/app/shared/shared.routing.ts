import { Routes, RouterModule } from "@angular/router";

import { PageNotFoundComponent } from "./pagenotfound/pagenotfound.component";
import { SignInComponent } from "./sign-in/sign-in.component";
import { InfoComponent } from "./info/info.component";

const SHARED_ROUTES: Routes = [
  { path: 'not-found', component: PageNotFoundComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'info', component: InfoComponent },
  
 ];

export const sharedRouting = RouterModule.forChild(SHARED_ROUTES);