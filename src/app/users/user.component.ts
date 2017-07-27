import { Component, Input, OnInit, EventEmitter, OnDestroy } from "@angular/core";
import { User } from "./user.model";
import { UserService } from "./user.service";
import { DialogService } from "../dialog/dialog.service";
import { Consts } from "../shared/consts";
import { DialogRetEnum } from "../dialog/dialog-ret.enum";
import { Dialog } from "../dialog/dialog.model";

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
    `]
})
export class UserComponent implements OnInit,OnDestroy {
    @Input() user: User;
    @Input() index: Number;
    defaultProfilePicFile = Consts.DEFAULT_PROFILE_PIC_FILE;;
    constructor(private userService: UserService, private dialogService: DialogService) { }

    onDelete() {

        let retDialogSub = new EventEmitter<DialogRetEnum>();

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    this.userService.deleteUser(this.user)
                        .subscribe(
                        result => console.log(result)
                        );
                }
            });

        this.dialogService.showDialog("Warning", "Do you really wish to delete this user?", "Yes", "No", retDialogSub);
    }

    ngOnInit() {

    }

    destroy(sub: any) {
        if (sub) {
            sub.unsubscribe();
            sub = null;
        }
    }

    ngOnDestroy() {
    }
}