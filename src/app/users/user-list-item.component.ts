import { Component, Input, ViewContainerRef, EventEmitter, ViewChild } from "@angular/core";
import { User } from './user.model';
import { UserService } from "./user.service";
import { ToastService } from "../shared/toast/toast.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Utils, LoglevelEnum } from "../shared/utils/utils";
import { ContextMenuComponent } from 'ngx-contextmenu';
import { CommentsService } from "../shared/comments/comments.service";
import { Consts } from "../shared/consts";

@Component({
    selector: 'app-user-list-item',
    templateUrl: './user-list-item.component.html',
    styleUrls: ['./user-list-item.component.css'],

})
export class UserListItemComponent {
    @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

    @Input() user: User;

    @Input() index: number;


    defaultProfilePicFile = Consts.DEFAULT_PROFILE_PIC_FILE;

    constructor(private dialogService: DialogService, private userService: UserService, private toastService: ToastService, private vcr: ViewContainerRef) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    getSource(): string {
        let retVal: string = this.defaultProfilePicFile;
        if (this.user && this.user.profilePicInfo && this.user.profilePicInfo.location) {
            retVal = this.user.profilePicInfo.location;
        }
        return retVal;
    }


    deleteUser() {

        let retDialogSub = new EventEmitter<DialogRetEnum>();
        let userListItemComponent = this;
        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    this.userService.deleteUser(userListItemComponent.user)
                        .subscribe(
                        result => Utils.log(LoglevelEnum.Info, userListItemComponent, result)
                        );
                }
            });

        this.dialogService.showDialog("Warning", "Do you really wish to delete this user?", "Yes", "No", retDialogSub);
    }

}