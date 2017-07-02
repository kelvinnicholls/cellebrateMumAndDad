import { Component, OnInit } from "@angular/core";

import { User } from "./user.model";
import { UserService } from "./user.service";

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
    users: User[];

    constructor(private userService: UserService) { }

    ngOnInit() {
        this.userService.getUsers()
            .subscribe(
            (users: User[]) => {
                this.users = users;
            }
            );
    }
}