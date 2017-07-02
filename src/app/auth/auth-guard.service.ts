import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Route, Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.authService.isAuthorised(route)) {
      return true;
    }
    this.router.navigate(['not-found']);
    return false;
  }


  // Import CanLoad from '@angular/router' and implement CanLoad
  // canLoad(route: Route) {
  //   return this.authService.isAuthenticated();
  // }
}
