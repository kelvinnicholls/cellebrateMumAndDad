import { Component, Input, OnInit } from "@angular/core";

import { User } from "./user.model";
import { UserService } from "./user.service";
import { Consts } from "../shared/consts";

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styles: [`
        .author {
            display: inline-block;
            font-style: italic;
            font-size: 12px;
            color : #0275d8;
        }
        .config {
            display: inline-block;
            text-align: right;
            font-size: 12px;
            color : #0275d8;
        }
        a { cursor: pointer;}
        .list-group-item.active {
            background-color: #eceeef;
        }
    `]
})
export class UserComponent implements OnInit {
    @Input() user: User;
    @Input() index: Number;
    selectedIndex: Number;
    private selectedUserIndexSub: any;
    defaultProfilePicFile = Consts.DEFAULT_PROFILE_PIC_FILE;;
    constructor(private userService: UserService) { }

    onEdit() {
        this.userService.selectUser(this.index);
        this.userService.editUser(this.user);
    }

    onDelete() {
        this.userService.deleteUser(this.user)
            .subscribe(
            result => console.log(result)
            );
    }

    ngOnInit() {
        this.selectedUserIndexSub = this.userService.selectedUserIndex.subscribe(
            (index: number) => {
                this.selectedIndex = index;
            }
        );
    }

    isSelected(): boolean {
        let ret = false;
        if (this.index === this.selectedIndex) {
            ret = true;
        }
        return ret;
    }


    destroy(sub: any) {
        if (sub) {
            sub.unsubscribe();
            sub = null;
        }
    }

    ngOnDestroy() {
        this.destroy(this.selectedUserIndexSub);
    }
}