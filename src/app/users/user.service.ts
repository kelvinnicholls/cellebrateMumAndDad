import { Http, Response, Headers } from "@angular/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import 'rxjs/Rx';
import { Observable } from "rxjs";
import { Consts } from "../shared/consts";
import { User } from "./user.model";
import { ErrorService } from "../errors/error.service";
import * as moment from 'moment';

@Injectable()
export class UserService {
    private users: User[] = [];
    userIsEdit = new EventEmitter<User>();
    showUserInput = new EventEmitter<Boolean>();
    clearUserInput = new EventEmitter<Boolean>();
    selectedUserIndex = new EventEmitter<Number>();
    constructor(private http: Http, private errorService: ErrorService, private router: Router) { }

    addUser(user: User) {
        var fd = new FormData();
        const headers: Headers = new Headers();
        if (user.profilePicData) {
            fd.append('file', user.profilePicData, user.profilePicData.name);
        };
        //else {
        //     headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
        // }
        user.profilePicData = null;
        const userJsonString = JSON.stringify(user);
        fd.append('user', userJsonString);
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let userService = this;
        return this.http.post(Consts.API_URL_USERS_ROOT, fd, { headers: headers })
            .map((response: Response) => {
                const result = response.json();
                let location = null;
                if (result.location) {
                    location = result.location;
                };
                const user = new User(
                    result.email,
                    null,
                    result.name,
                    result.adminUser ? 'Yes' : 'No',
                    result.relationship,
                    moment(result.dob).format('YYYY-MM-DD'),
                    result.twitterId,
                    result.facebookId,
                    result._creatorRef,
                    null,
                    location);
                userService.users.push(user);
                return user;
            })
            .catch((error: Response) => {
                userService.errorService.handleError(error.json());
                return Observable.throw(error.json().error);
            });
    }

    getUsers() {
        const headers: Headers = new Headers();
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let userService = this;
        return this.http.get(Consts.API_URL_USERS_ROOT, { headers: headers })
            .map((response: Response) => {
                const users = response.json();
                let transformedUsers: User[] = [];
                for (let user of users) {
                    let location = null;
                    if (user._profileMediaId && user._profileMediaId.location) {
                        location = user._profileMediaId.location;
                    };
                    transformedUsers.push(new User(
                        user.email,
                        null,
                        user.name,
                        user.adminUser ? 'Yes' : 'No',
                        user.relationship,
                        moment(user.dob).format('YYYY-MM-DD'),
                        user.twitterId,
                        user.facebookId,
                        user._creatorRef,
                        null,
                        location));
                }
                this.users = transformedUsers;
                return transformedUsers;
            })
            .catch((error: Response) => {
                userService.errorService.handleError(error.json());
                return Observable.throw(error.json().error);
            });
    }

    getMe() {
        const headers: Headers = new Headers();
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let userService = this;

        return this.http.get(Consts.API_URL_USERS_ROOT + '/me', { headers: headers })
            .map((response: Response) => {
                const user = response.json();
                let location = null;
                if (user._profileMediaId && user._profileMediaId.location) {
                    location = user._profileMediaId.location;
                };
                let transformedUser: User = new User(
                    user.email,
                    null,
                    user.name,
                    user.adminUser ? 'Yes' : 'No',
                    user.relationship,
                    moment(user.dob).format('YYYY-MM-DD'),
                    user.twitterId,
                    user.facebookId,
                    user._creatorRef,
                    null,
                    location);
                return transformedUser;
            })
            .catch((error: Response) => {
                userService.errorService.handleError(error.json());
                return Observable.throw(error.json().error);
            });
    }

    editUser(user: User) {
        this.showUserInput.emit(true);
        this.userIsEdit.emit(user);
    }

    selectUser(index: Number) {
        this.selectedUserIndex.emit(index);
    }

    updateUser(user: User) {
        var fd = new FormData();
        const headers: Headers = new Headers();
        if (user.profilePicData) {
            fd.append('file', user.profilePicData, user.profilePicData.name);
        };
        //else {
        //     headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
        // }

        user.profilePicData = null;
        const userJsonString = JSON.stringify(user);
        fd.append('user', userJsonString);

        //headers.append(Consts.CONTENT_TYPE, Consts.MULTIPART_FORM_DATA);
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let userService = this;
        return this.http.patch(Consts.API_URL_USERS_ROOT + '/' + user._creatorRef, fd, { headers: headers })
            .map((response: any) => {
                let body = JSON.parse(response._body);
                if (body._profileMediaId) {
                    user.profilePicLocation = body._profileMediaId.location.substring(14);
                };

                this.users.forEach((element, index) => {
                    if (element._creatorRef === user._creatorRef) {
                        return this.users[index] = user;
                    };
                });

                let loggedInUser = JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER));
                if (loggedInUser._creatorRef === user._creatorRef) {
                    localStorage.setItem(Consts.LOGGED_IN_USER, JSON.stringify(user));
                }

                return response.json();
            })
            .catch((error: Response) => {
                userService.errorService.handleError(error.json());
                return Observable.throw(error.json().error);
            });
    }

    deleteUser(user: User) {

        const headers: Headers = new Headers();
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let userService = this;
        return this.http.delete(Consts.API_URL_USERS_ROOT + '/' + user._creatorRef, { headers: headers })
            .map((response: Response) => {
                userService.users.splice(this.users.indexOf(user), 1);
                return response.json();
            })
            .catch((error: Response) => {
                userService.errorService.handleError(error.json());
                return Observable.throw(error.json().error);
            });
    }

    changePassword(oldPassword: string, newPassword: string) {
        const body = {
            oldPassword,
            newPassword
        };
        const headers: Headers = new Headers();
        headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let userService = this;
        return this.http.patch(Consts.API_URL_USERS_ROOT + '/change-password', body, { headers: headers })
            .map((response: Response) => {
                this.router.navigate(['']);
                response.json();
            })
            .catch((error: Response) => {
                userService.errorService.handleError(error.json());
                return Observable.throw(error.json().error);
            })
    }


    emailExists(email: string, creatorRef: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));
            this.http.get(Consts.API_URL_USERS_ROOT_EMAIL + '/' + email, { headers: headers }).subscribe(
                (response: any) => {
                    let body = JSON.parse(response._body);
                    if ((body.emailFound && !creatorRef) || (body.emailFound && creatorRef && body._creatorRef != creatorRef)) {
                        resolve({ 'emailIsAlreadyUsed': true });
                    } else {
                        resolve(null);
                    }
                }
            );  
        });
    }

    nameExists(name: string, creatorRef: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));
            this.http.get(Consts.API_URL_USERS_ROOT_NAME + '/' + name, { headers: headers }).subscribe(
                (response: any) => {
                    let body = JSON.parse(response._body);
                    if ((body.nameFound && !creatorRef) || (body.nameFound && creatorRef && body._creatorRef != creatorRef)) {
                        resolve({ 'nameIsAlreadyUsed': true });
                    } else {
                        resolve(null);
                    }
                }
            );  
        });
    }

}