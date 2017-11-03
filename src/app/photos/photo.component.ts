import { Component, Input, OnInit, EventEmitter, OnDestroy } from "@angular/core";
import { Photo } from "./photo.model";
import { PhotoService } from "./photo.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { Consts } from "../shared/consts";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Dialog } from "../shared/dialog/dialog.model";
import { CommentsService } from "../shared/comments/comments.service";

@Component({
    selector: 'app-photo',
    templateUrl: './photo.component.html',
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
export class PhotoComponent implements OnInit, OnDestroy {
    @Input() photo: Photo;
    @Input() mode: String;
    //@Input() index: Number;
    defaultPhotoFile = Consts.DEFAULT_PHOTO_PIC_FILE;;
    constructor(private photoService: PhotoService, private dialogService: DialogService, private commentsService: CommentsService) { }


    showComments() {
        this.commentsService.showComments("Comments for photo: '" + this.photo.title + "'", this.photo.comments);
    }


    checkCanDelete(): boolean {
        return this.photoService.isAllowed('D', this.photo);
    }

    onDelete() {

        let retDialogSub = new EventEmitter<DialogRetEnum>();

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    this.photoService.deletePhoto(this.photo)
                        .subscribe(
                        result => console.log(result)
                        );
                }
            });

        this.dialogService.showDialog("Warning", "Do you really wish to delete this photo?", "Yes", "No", retDialogSub);
    }

    ngOnInit() {

    }

    getSource(): string {
        let retVal: string = this.defaultPhotoFile;
        if (this.photo && this.photo.photoInfo && this.photo.photoInfo.location) {
            retVal = this.photo.photoInfo.location;
        }
        return retVal;
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