import { Routes, RouterModule } from "@angular/router";

import { PageNotFoundComponent } from "./pagenotfound/pagenotfound.component";

const SHARED_ROUTES: Routes = [
  { path: 'not-found', component: PageNotFoundComponent }
 ];

export const sharedRouting = RouterModule.forChild(SHARED_ROUTES);