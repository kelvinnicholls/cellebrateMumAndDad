import { Component, Input, ViewContainerRef, EventEmitter, ViewChild } from "@angular/core";
import { Photo } from "./photo.model";
import { PhotoService } from "./photo.service";
import { ToastService } from "../shared/toast/toast.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Utils, LoglevelEnum } from "../shared/utils/utils";
import { ContextMenuComponent } from 'ngx-contextmenu';
import { CommentsService } from "../shared/comments/comments.service";

@Component({
    selector: 'app-photo-list-item',
    templateUrl: './photo-list-item.component.html',
    styleUrls: ['./photo-list-item.component.css'],

})
export class PhotoListItemComponent {
    @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

    @Input() photo: Photo;

    @Input() index: number;

    constructor(private commentsService: CommentsService, private dialogService: DialogService, public photoService: PhotoService, private toastService: ToastService, private vcr: ViewContainerRef) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    checkCanDelete(photo: Photo): boolean {
        return this.photoService.isAllowed('D', photo);
    }

    deletePhoto() {

        let retDialogSub = new EventEmitter<DialogRetEnum>();
        let photoListItemComponent = this;
        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    this.photoService.deletePhoto(photoListItemComponent.photo)
                        .subscribe(
                        result => Utils.log(LoglevelEnum.Info, photoListItemComponent, result)
                        );
                }
            });

        this.dialogService.showDialog("Warning", "Do you really wish to delete this photo?", "Yes", "No", retDialogSub);
    }

    addComment() {
        this.commentsService.showAddComment(this.photo);
    };

    showComments() {
        this.commentsService.showComments("Comments for photo: '" + this.photo.title + "'", this.photo.comments);
    }
}