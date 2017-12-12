import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommentDisplay, Comments } from "../comment.model";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DialogService } from "../../dialog/dialog.service";
import { DialogRetEnum } from "../../dialog/dialog-ret.enum";
import { Dialog } from "../../dialog/dialog.model";
import { AppService } from "../../../app.service";
import { EventEmitter } from "@angular/core";
import { CommentsService } from "../comments.service";
import { Utils, LoglevelEnum } from "../../../shared/utils/utils";
import { Photo } from "../../../photos/photo.model";
import { Memory } from "../../../memories/memory.model";
import { Comment } from "../comment.model";
import { Consts } from "../../consts";
import { AuthUserService } from "../../../auth/auth-user.service";

@Component({
  selector: 'app-comment-add-popup',
  templateUrl: './comment-add-popup.component.html',
  styleUrls: ['./comment-add-popup.component.css']
})
export class CommentAddPopupComponent implements OnInit, OnDestroy {
  myForm: FormGroup;

  entity: Photo | Memory;

  title: string = "";

  display = 'none';
  private showAddCommentsSub: EventEmitter<Photo | Memory>;

  private static readonly ADD_COMMENT = "Add Comment for ";

  constructor(private commentsService: CommentsService, private dialogService: DialogService, private appService: AppService, private authUserService: AuthUserService) {

  }

  close() {
    this.display = 'none';
    
  }

  onClose() {
    this.close();
    this.myForm.reset();
  };


  onSubmit() {
    this.close();
    let retDialogSub = new EventEmitter<DialogRetEnum>();
    let commentAddPopupComponent = this;

    retDialogSub.subscribe(
      (buttonPressed: DialogRetEnum) => {
        if (buttonPressed === DialogRetEnum.ButtonOne) {
          const comment = new Comment(commentAddPopupComponent.entity, commentAddPopupComponent.myForm.value.comment, () => {
            this.appService.showToast(Consts.SUCCESS, "Comment added.");
          });
          this.commentsService.commentSub.emit(comment);
        };
        this.myForm.reset();
      });

    let message = "Do you really wish to add this comment?";
    this.dialogService.showDialog("Warning", message, "Yes", "No", retDialogSub);
  }

  ngOnInit() {
    this.myForm = new FormGroup({
      comment: new FormControl(null, Validators.required)
    });

    this.showAddCommentsSub = this.commentsService.showAddCommentsSub
      .subscribe(
      (entity: Photo | Memory) => {
        if (entity.entityType === Consts.PHOTO) {
          this.title = CommentAddPopupComponent.ADD_COMMENT + "Photo " + entity.title;
          this.entity = entity;
          this.display = 'block';

        } else if (entity.entityType === Consts.MEMORY) {
          this.title = CommentAddPopupComponent.ADD_COMMENT + "Memory " + entity.title;
          this.entity = entity;
          this.display = 'block';
        };
      }
      );
  }

  destroy(sub: any) {
    if (sub) {
      sub.unsubscribe();
      sub = null;
    }
  }

  ngOnDestroy() {
    this.destroy(this.showAddCommentsSub);
  }

  isFormValid() {
    let retVal = false;
    if (!this.authUserService.isGuestUser() && this.myForm.valid && this.myForm.dirty) {
      retVal = true
    }
    return retVal;
  }

}
