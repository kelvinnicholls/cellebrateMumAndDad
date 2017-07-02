import { Component, OnInit } from "@angular/core";

import { UserService } from "./user.service";

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {

    constructor(private userService: UserService) { }

    show: Boolean = false;

    showUserInput(): Boolean {
        return this.show;
    }

    ngOnInit() {
        this.userService.showUserInput.subscribe(
            (show: Boolean) => {
                this.show = show;
            }
        );
    }

    createUser() {
        this.userService.showUserInput.emit(true);
        this.userService.clearUserInput.emit(true);
    }
}

// `
//         <div class="row">
//             <app-user-input></app-user-input>
//         </div>
//         <hr>
//         <div class="row">
//             <app-user-list></app-user-list>
//         </div>
//     `