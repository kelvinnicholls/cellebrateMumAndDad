import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Router, ActivatedRouteSnapshot } from "@angular/router";
import 'rxjs/Rx';
import { Observable } from "rxjs";

import { AppService } from "../app.service";
import { ChatService } from "../chat/chat.service";
import { AuthUserService } from "./auth-user.service";
import { SignInUser } from "../shared/sign-in/sign-in-user.model";
import { Consts } from "../shared/consts";
import { Utils, LoglevelEnum } from "../shared/utils/utils";
@Injectable()
export class AuthService {
    private static Consts: Consts;
    constructor(private http: Http
        , private router: Router
        , private appService: AppService
        , private authUserService: AuthUserService
        , private chatService: ChatService) {

    }


    signIn(user: SignInUser) {
        const headers: Headers = new Headers();
        headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
        localStorage.clear();
        const body = JSON.stringify(user);
        return this.http.post(Consts.API_URL_USERS_ROOT + '/login', body, { headers: headers });
    };

    getEncryptedPassword(password: string) {
        const headers: Headers = new Headers();
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        headers.set('password', password);
        return this.http.get(Consts.API_URL_USERS_ROOT + '/getEncryptedPassword', { headers: headers })
            .map((response: Response) => response.json())
            .catch((error: Response) => Observable.throw(error.toString()));
    };


    clear() {
        localStorage.clear();
        this.chatService.logOut();
    }


    logOut() {
        let authService = this;
        const headers: Headers = new Headers();
        headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let router = authService.router;
        authService.http.delete(Consts.API_URL_USERS_ROOT + '/me/token', { headers: headers })
            .map((response: Response) => {
                Utils.log(LoglevelEnum.Info,this, "logOut() success");
                return response.json();
            })
            .catch((error: Response) => {
                localStorage.clear();
                Utils.log(LoglevelEnum.Info,this, "logOut() error", error.toString());
                return Observable.throw(error.toString());
            }).subscribe(
            (response) => {
                authService.clear();
                Utils.log(LoglevelEnum.Info,this, "logOut() response", response);
                router.navigate(['']);
                authService.appService.showToast(Consts.SUCCESS, "User logged out.");
            }, (err) => {
                authService.clear();
                Utils.log(LoglevelEnum.Info,this, "logOut() err", err);
            }
            );
    };

    isAdminRoute(route: ActivatedRouteSnapshot): boolean {
        let ret = false;
        Utils.log(LoglevelEnum.Info,this, "isAdminRoute", route.component.toString());
        if (route.component.toString().includes('"PhotoListComponent"')) {
            ret = false;
        } else
            if (route.component.toString().includes('"MemoryListComponent"')) {
                ret = false;
            } else
                if (route.url.length == 0) {
                    ret = true;
                } else
                    if (route.url.length == 1 && route.url[0].path === "users") {
                        ret = true;
                    } else
                        if (route.url.length == 2 && route.url[0].path === "auth" && route.url[1].path === "get-encrypted-password") {
                            ret = true;
                        };
        Utils.log(LoglevelEnum.Info,this, "isAdminRoute ret:", ret);
        return ret;
    };

    isAuthorised(route: ActivatedRouteSnapshot): boolean {
        let ret: boolean = true;
        if (this.authUserService.isLoggedIn()) {
            Utils.log(LoglevelEnum.Info,this, "AuthService.isAuthorised is logged in");
            if (!this.authUserService.isAdminUser() && (this.isAdminRoute(route))) {
                ret = false;
            }
        } else {
            Utils.log(LoglevelEnum.Info,this, "AuthService.isAuthorised not logged in");
            ret = false;
        };

        Utils.log(LoglevelEnum.Info,this, "AuthService.isAuthorised ret: ", ret);
        return ret;
    };
}
