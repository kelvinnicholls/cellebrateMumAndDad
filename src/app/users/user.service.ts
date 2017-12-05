import { Http, Response, Headers } from "@angular/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Subject } from 'rxjs/Subject';
import { Router } from "@angular/router";
import * as moment from 'moment';
import 'rxjs/Rx';
import { Observable } from "rxjs";
import { Consts } from "../shared/consts";
import { User } from "./user.model";
import { AppService } from "../app.service";
import { ErrorService } from "../shared/errors/error.service";
import { SearchService } from "../shared/search/search.service";
import { SearchRetEnum } from "../shared/search/search-ret.enum";
import { SearchRet } from "../shared/search/search-ret.model";
import { Search } from "../shared/search/search.model";
import { SearchTypeEnum } from "../shared/search/search-type.enum";
import { Utils,LoglevelEnum } from "../shared/utils/utils";
import { AuthUserService } from '../auth/auth-user.service';


@Injectable()
export class UserService {

    public users: User[] = [];
    public eventPage: number = 1;
    public bigCurrentPage: number = 1;
    private allUsers: User[] = [];
    private retrievedUsers = false;
    constructor(private authUserService: AuthUserService, private http: Http, private errorService: ErrorService, private appService: AppService, private searchService: SearchService, private router: Router) {
        this.initialize();
    }

    async initialize() {
        this.getUsers();
    }

    usersChanged = new Subject<User[]>();
    showSuccessToast = new EventEmitter<string>();

    public searchRet: SearchRet;

    findUserByIndex(index: any): User {
        return this.users[index];
    }

    findUserByCreatorRef(creatorRef: any): User {
        return this.users.find((user) => {
            return user._creatorRef === creatorRef;
        });
    }

    private socket;

    createUser(user, profilePicInfo): User {
        return new User(
            user.email,
            null,
            user.name,
            user.adminUser ? 'Yes' : 'No',
            user.guestUser ? 'Yes' : 'No',
            user.emailUpdates ? 'Yes' : 'No',
            user.relationship,
            moment(user.dob).format(Consts.DATE_DB_FORMAT),
            null, //user.twitterId,
            null, //user.facebookId,
            user._creatorRef,
            null,
            profilePicInfo);
    }

    public getLoggedInUser() {
        Utils.log(LoglevelEnum.Info,this,"UserService.getLoggedInUser()")
        return JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER));
    }

    updateLocalStorage(user) {
        let loggedInUser = this.getLoggedInUser();
        if (loggedInUser._creatorRef === user._creatorRef) {
            localStorage.setItem(Consts.LOGGED_IN_USER, JSON.stringify(user));
        }
    }


    public isAllowed(changeType, user: User): boolean {
        let retVal: boolean = true;
        if (changeType == "U" || changeType == "D") {
            retVal = Utils.checkIsAdminOrOwner(user._creatorRef, this.getLoggedInUser(), this.authUserService);
        };
        Utils.log(LoglevelEnum.Info,this,"isAllowed retVal", retVal);
        return retVal;
    }

    public getMode(user: User) {
        if (this.isAllowed('U', user)) {
            return Consts.EDIT;
        } else {
            return Consts.VIEW;
        };
    }

    updateThisUser(user): any {
        const updateUser = this.createUser(user, user.profilePicInfo);
        if (!updateUser.profilePicInfo) {
            updateUser.profilePicInfo = {};
        };
        if (user._profileMediaId && !user._profileMediaId.isUrl) {
            updateUser.profilePicInfo.location = user._profileMediaId.location.substring(14);
        } else if (user._profileMediaId && user._profileMediaId.isUrl) {
            updateUser.profilePicInfo.location = user._profileMediaId.location;
        };

        this.users.forEach((element, index) => {
            if (element._creatorRef === updateUser._creatorRef) {
                this.users[index] = updateUser;
                this.updateLocalStorage(updateUser);
                this.usersChanged.next(this.users);
                return updateUser;
            };
        });
        return updateUser;
    }

    addCallbacks(socket: any) {
        this.socket = socket;

        this.socket.on('createdUser', (user, changedBy) => {
            this.users.push(this.createUser(user, user.profilePicInfo));
            this.usersChanged.next(this.users);
            this.appService.showToast(Consts.INFO, "New user  : " + user.name + " added by " + changedBy);
            Utils.log(LoglevelEnum.Info,this, "New user  : " + user.name + " added by " + changedBy);
        });

        this.socket.on('updatedUser', (user, changedBy) => {
            let updatedUser = this.updateThisUser(user);
            this.appService.showToast(Consts.INFO, "User  : " + updatedUser.name + " updated by " + changedBy);
            Utils.log(LoglevelEnum.Info,this, "User  : " + updatedUser.name + " updated by " + changedBy);
        });


        this.socket.on('deletedUser', (creatorRef, changedBy) => {
            let userToBeDeleted = this.findUserByCreatorRef(creatorRef);
            if (userToBeDeleted) {
                this.users.splice(this.users.indexOf(userToBeDeleted), 1);
                this.usersChanged.next(this.users);
                this.appService.showToast(Consts.INFO, "User  : " + userToBeDeleted.name + " deleted by " + changedBy);
                Utils.log(LoglevelEnum.Info,this, "User  : " + userToBeDeleted.name + " deleted by " + changedBy);
            };
        });
    }

    addUser(user: User) {
        var fd = new FormData();
        const headers: Headers = new Headers();
        if (user.profilePicFile) {
            fd.append('file', user.profilePicFile);
        };

        user.profilePicFile = null;
        const userJsonString = JSON.stringify(user);
        fd.append('user', userJsonString);
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let userService = this;
        return this.http.post(Consts.API_URL_USERS_ROOT, fd, { headers: headers })
            .map((response: Response) => {
                const result = response.json();
                let profilePicInfo: any = {};
                profilePicInfo.location = result.location;
                profilePicInfo.isUrl = result.isUrl;
                const user = this.createUser(result, profilePicInfo);
                userService.users.push(user);

                this.socket.emit('userCreated', user, function (err) {
                    if (err) {
                        Utils.log(LoglevelEnum.Info,this,"userCreated err: ", err);
                    } else {
                        Utils.log(LoglevelEnum.Info,this,"userCreated No Error");
                    }
                });

                userService.usersChanged.next(this.users);
                return user;
            })
            .catch((error: Response) => {
                userService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
            });
    }

    getUsers(refresh: Boolean = false) {
        let userService = this;
        if ((!userService.retrievedUsers || refresh) && userService.authUserService.isLoggedIn()) {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));

            this.http.get(Consts.API_URL_USERS_ROOT, { headers: headers })
                .map((response: Response) => {
                    const users = response.json();
                    let transformedUsers: User[] = [];
                    for (let user of users) {
                        let profilePicInfo: any = {};
                        if (user._profileMediaId && user._profileMediaId.location) {
                            profilePicInfo.location = user._profileMediaId.location;
                            profilePicInfo.isUrl = user._profileMediaId.isUrl;
                        };

                        let newUser = new User(
                            user.email,
                            null,
                            user.name,
                            user.adminUser ? 'Yes' : 'No',
                            user.guestUser ? 'Yes' : 'No',
                            user.emailUpdates ? 'Yes' : 'No',
                            user.relationship,
                            moment(user.dob).format(Consts.DATE_DB_FORMAT),
                            null, //user.twitterId,
                            null, //user.facebookId,
                            user._creatorRef,
                            null,
                            profilePicInfo);
                        transformedUsers.push(newUser);
                        this.updateLocalStorage(newUser);
                    };
                    userService.allUsers = transformedUsers;
                    if (userService.searchRet) {
                        userService.users = Search.restrict(userService.allUsers, userService.searchRet);
                    } else {
                        userService.users = userService.allUsers.slice(0);
                    };
                    userService.retrievedUsers = true;
                })
                .catch((error: Response) => {
                    userService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                    return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
                }).subscribe();
        };
    }

    getMe() {
        const headers: Headers = new Headers();
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let userService = this;

        return this.http.get(Consts.API_URL_USERS_ROOT + '/me', { headers: headers })
            .map((response: Response) => {
                const user = response.json();
                let profilePicInfo: any = {};
                if (user._profileMediaId && user._profileMediaId.location) {
                    profilePicInfo.location = user._profileMediaId.location;
                    profilePicInfo.isUrl = user._profileMediaId.isUrl;
                };
                let transformedUser: User = new User(
                    user.email,
                    null,
                    user.name,
                    user.adminUser ? 'Yes' : 'No',
                    user.guestUser ? 'Yes' : 'No',
                    user.emailUpdates ? 'Yes' : 'No',
                    user.relationship,
                    moment(user.dob).format(Consts.DATE_DB_FORMAT),
                    null, //user.twitterId,
                    null, //user.facebookId,
                    user._creatorRef,
                    null,
                    profilePicInfo);
                return transformedUser;
            })
            .catch((error: Response) => {
                userService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
            });
    }


    updateUser(user: User) {
        var fd = new FormData();
        const headers: Headers = new Headers();
        if (user.profilePicFile) {
            fd.append('file', user.profilePicFile);
        };

        user.profilePicFile = null;
        const userJsonString = JSON.stringify(user);
        fd.append('user', userJsonString);

        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let userService = this;
        return this.http.patch(Consts.API_URL_USERS_ROOT + '/' + user._creatorRef, fd, { headers: headers })
            .map((response: any) => {
                let body = JSON.parse(response._body);
                let updatedUser = userService.updateThisUser(body);

                this.socket.emit('userUpdated', updatedUser, function (err) {
                    if (err) {
                        Utils.log(LoglevelEnum.Info,this,"userUpdated err: ", err);
                    } else {
                        Utils.log(LoglevelEnum.Info,this,"userUpdated No Error");
                    }
                });

                return response.json();
            })
            .catch((error: Response) => {
                userService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
            });
    }

    deleteUser(user: User) {

        const headers: Headers = new Headers();
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let userService = this;
        return this.http.delete(Consts.API_URL_USERS_ROOT + '/' + user._creatorRef, { headers: headers })
            .map((response: Response) => {
                userService.users.splice(user.index, 1);

                this.socket.emit('userDeleted', user, function (err) {
                    if (err) {
                        Utils.log(LoglevelEnum.Info,this,"userDeleted err: ", err);
                    } else {
                        Utils.log(LoglevelEnum.Info,this,"userDeleted No Error");
                    }
                });

                userService.usersChanged.next(userService.users);
                return response.json();
            })
            .catch((error: Response) => {
                userService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
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
                response.json();
            })
            .catch((error: Response) => {
                userService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
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

    clearSearch() {
        this.users = this.allUsers;
        this.searchRet = null;
        //this.eventPage = 1;
        //this.bigCurrentPage = 1;
        this.usersChanged.next(this.users);
    }

    showSearchCriteria() {
        let retVal: String = "";
        if (this.searchRet) {
            retVal = this.searchRet.getSearchCriteria(null, null);
        };
        return retVal;
    }

    search() {
        let retSearchSub = new EventEmitter<SearchRet>();

        retSearchSub.subscribe(
            (searchRet: SearchRet) => {

                let buttonPressed = searchRet.searchRetEnum;
                if (buttonPressed === SearchRetEnum.ButtonOne) {
                    this.users = Search.restrict(this.allUsers, searchRet);
                    this.searchRet = searchRet;
                    this.eventPage = 1;
                    this.usersChanged.next(this.users);
                    this.appService.showToast(Consts.SUCCESS, "User list updated.");
                } else {
                    this.appService.showToast(Consts.WARNING, "Search cancelled.");
                }
            });
        let searchFields: String[] = [];
        searchFields.push('adminUser');
        searchFields.push('guestUser');
        searchFields.push('emailUpdates');
        searchFields.push('email');
        searchFields.push('name');
        //searchFields.push('twitterId');
        //searchFields.push('facebookId');
        searchFields.push('relationship');
        searchFields.push('from_date');
        searchFields.push('to_date');
        this.searchService.showSearch("Search Users", "Enter criteria to restrict list of users", "Find", "Cancel", retSearchSub, SearchTypeEnum.Users, searchFields);
    }
}