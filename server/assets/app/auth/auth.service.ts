import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Router, ActivatedRouteSnapshot } from "@angular/router";
import 'rxjs/Rx';
import { Observable } from "rxjs";

import { SignInUser } from "./user.model";
import { Consts } from "../shared/consts";

@Injectable()
export class AuthService {
    private static Consts: Consts;
    constructor(private http: Http, private router: Router) { }

    //response.json() removes header etc and returns only data in JSON format and returns an observable
    // Observable.throw(error.json()) is needed because catch does not automatically return an observable

    signIn(user: SignInUser) {
        const headers: Headers = new Headers();
        headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
        localStorage.clear();
        const body = JSON.stringify(user);
        return this.http.post(Consts.API_URL_USERS_ROOT + '/login', body, { headers: headers });

    }

    getEncryptedPassword(password: string) {
        const headers: Headers = new Headers();
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        headers.set('password', password);
        return this.http.get(Consts.API_URL_USERS_ROOT + '/getEncryptedPassword', { headers: headers })
            .map((response: Response) => response.json())
            .catch((error: Response) => Observable.throw(error.json().error));
    }

    logOut() {
        const headers: Headers = new Headers();
        headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let router = this.router;
        this.http.delete(Consts.API_URL_USERS_ROOT + '/me/token', { headers: headers })
            .map((response: Response) => {
                console.log("logOut() success");
                return response.json();
            })
            .catch((error: Response) => {
                console.log("logOut() error", error);
                return Observable.throw(error.json().error);
            }).subscribe(
            (response) => {
                localStorage.clear();
                console.log("logOut() response", response);
                router.navigate(['']);
            }, (err) => {
                console.log("logOut() err", err);
            }
            );
    }

    isLoggedIn(): boolean {
        return localStorage.getItem('token') !== null;
    }

    isAdminUser(): boolean {
        return JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER)).adminUser;
    }

    getLoggedInUser() {
        return JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER)).name;
    }

    getLoggedInCreatorRef() {
        return JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER))._creatorRef;
    }
    isAdminRoute(route: ActivatedRouteSnapshot): boolean {
        let ret = false;
        if (route.url.length == 1 && route.url[0].path === "users") {
            ret = true;
        } else
            if (route.url.length == 2 && route.url[0].path === "auth" && route.url[1].path === "get-encrypted-password") {
                ret = true;
            }
        return ret;
    }

    isAuthorised(route: ActivatedRouteSnapshot): boolean {
        let ret: boolean = true;
        if (this.isLoggedIn()) {
            if (!this.isAdminUser() && (this.isAdminRoute(route))) {
                ret = false;
            }
        } else {
            ret = false;
        }
        return ret;
    }
}
