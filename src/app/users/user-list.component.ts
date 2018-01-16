import { Component, OnInit, OnDestroy, EventEmitter, ViewContainerRef } from "@angular/core";
import { Subscription } from 'rxjs/Subscription';
import { User } from "./user.model";
import { UserService } from "./user.service";
import { ToastService } from "../shared/toast/toast.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { Consts } from "../shared/consts";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Dialog } from "../shared/dialog/dialog.model";
import { Utils, LoglevelEnum } from "../shared/utils/utils";
import { listStateTrigger } from '../shared/animations';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css'],
    animations: [
        listStateTrigger
    ]
})
export class UserListComponent implements OnInit, OnDestroy {
    users: User[] = [];

    pagedUsers: User[] = [];

    subscription: Subscription;

    public maxSize: number = 6;
    public bigTotalItems: number = this.users.length;

    public numPages: number = 0;

    private itemsPerPage: number = 6;

    private eventItemsPerPage: number = 6;


    private hideSearchCriteriaText: String = "Hide Search Criteria";
    public showSearchCriteriaText: String = "Show Search Criteria";
    public toggleShowHideSearchCriteriaText = this.showSearchCriteriaText;

    toggleShowHideSearchCriteria() {
        if (this.toggleShowHideSearchCriteriaText === this.hideSearchCriteriaText) {
            this.toggleShowHideSearchCriteriaText = this.showSearchCriteriaText;
        } else {
            this.toggleShowHideSearchCriteriaText = this.hideSearchCriteriaText;
        }
    }

    private setUsersIndex() {
        let userListComponent = this;
        userListComponent.users.forEach(function (user: User, index) {
            userListComponent.users[index].index = index;
        });
    }

    private updatePagedUsers(itemsPerPage, page) {
        let startIndex = (itemsPerPage * (page - 1));
        let endIndex = startIndex + itemsPerPage - 1;
        Utils.log(LoglevelEnum.Info, this, 'startIndex : ', startIndex);
        Utils.log(LoglevelEnum.Info, this, 'endIndex : ', endIndex);
        this.setUsersIndex();
        this.pagedUsers = this.users.slice(startIndex, endIndex + 1);
    }

    public pageChanged(event: any): void {
        this.eventItemsPerPage = event.itemsPerPage;
        this.userService.eventPage = event.page;
        Utils.log(LoglevelEnum.Info, this, 'Page changed to: ' + this.userService.eventPage);
        Utils.log(LoglevelEnum.Info, this, 'Number items per page: ' + this.eventItemsPerPage);
        this.updatePagedUsers(this.eventItemsPerPage, this.userService.eventPage);
    }

    constructor(private userService: UserService, private toastService: ToastService, private vcr: ViewContainerRef, private dialogService: DialogService) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    onSearch() {
        this.userService.search();
    }

    onClearSearch() {
        this.userService.clearSearch();
        this.updatePagedUsers(this.eventItemsPerPage, this.userService.eventPage);
    }



    ngOnInit() {
        let userListComponent = this;

        this.newUserList(userListComponent.userService.users);
        // userListComponent.userService.getUsers()
        //     .subscribe(
        //     (users: User[]) => {
        //         this.newUserList(users)
        //     }
        //     );
        userListComponent.subscription = userListComponent.userService.usersChanged.subscribe((users: User[]) => userListComponent.newUserList(users));
    }

    newUserList(users: User[]) {
        this.users = users;
        this.bigTotalItems = this.users.length;
        this.userService.eventPage = 1;
        this.updatePagedUsers(this.eventItemsPerPage, this.userService.eventPage);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getNoUsersText(): string {
        let retVal = "No Users To Display!";
        if (this.userService.searchRet) {
            retVal = "Search returned no results!";
        };
        return retVal;
    }

}