import { CanActivate, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot, Route, Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';
import { AuthUserService } from './auth-user.service';
import { Utils, LoglevelEnum } from '../shared/utils/utils';
@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

  constructor(private authService: AuthService, private authUserService: AuthUserService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.authService.isAuthorised(route)) {
      Utils.log(LoglevelEnum.Info,this,"AuthGuard.canActivate is authorised");
      return true;
    };
    Utils.log(LoglevelEnum.Info,this,"AuthGuard.canActivate is not authorised");
    this.router.navigate(['not-found']);
    return false;
  }

  // canLoad(route: Route) {
  //   if (this.authService.isAuthorised(route)) {
  //     return true;
  //   }
  //   this.router.navigate(['not-found']);
  //   return false;
  // }

  // Import CanLoad from '@angular/router' and implement CanLoad
  canLoad(route: Route) {
    if (this.authUserService.isLoggedIn()) {
      return true;
    };
    this.router.navigate(['not-found']);
    return false;

  }
}
