import { Component, OnInit, OnDestroy, ViewContainerRef } from "@angular/core";
import { Subscription } from 'rxjs/Subscription';
import { User } from "./user.model";
import { UserService } from "./user.service";
import { ToastService } from "../shared/toast/toast.service";

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
    users: User[] = [];

    pagedUsers: User[] = [];


    subscription: Subscription;

    public maxSize: number = 5;
    public bigTotalItems: number = this.users.length;

    public numPages: number = 0;

    private itemsPerPage: number = 5;

    private eventItemsPerPage: number = 5;


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
        console.log('startIndex : ', startIndex);
        console.log('endIndex : ', endIndex);
        this.setUsersIndex();
        this.pagedUsers = this.users.slice(startIndex, endIndex + 1);
    }

    public pageChanged(event: any): void {
        this.eventItemsPerPage = event.itemsPerPage;
        this.userService.eventPage = event.page;
        console.log('Page changed to: ' + this.userService.eventPage);
        console.log('Number items per page: ' + this.eventItemsPerPage);
        this.updatePagedUsers(this.eventItemsPerPage, this.userService.eventPage);
    }

    constructor(private userService: UserService, private toastService: ToastService, private vcr: ViewContainerRef) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    onSearch() {
        this.userService.search();
    }

    onClearSearch() {
        this.userService.clearSearch();
    }

    ngOnInit() {
        let userListComponent = this;
        userListComponent.userService.showSuccessToast.subscribe((msg) => {
            userListComponent.toastService.showSuccess(msg);
        });
        userListComponent.userService.getUsers()
            .subscribe(
            (users: User[]) => {
                this.newUserList(users)
            }
            );
        userListComponent.subscription = userListComponent.userService.usersChanged.subscribe((users: User[]) => userListComponent.newUserList(users));
    }

    newUserList(users: User[]) {
        this.users = users;
        this.bigTotalItems = this.users.length;
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