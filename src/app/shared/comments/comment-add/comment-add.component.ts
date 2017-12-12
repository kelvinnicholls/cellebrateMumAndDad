import { Component, OnInit, EventEmitter, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DialogService } from "../../dialog/dialog.service";
import { DialogRetEnum } from "../../dialog/dialog-ret.enum";
import { Dialog } from "../../dialog/dialog.model";
import { Comment } from "../comment.model";
import { Subscription } from 'rxjs/Subscription';
import { CommentsService } from "../comments.service";
import { AppService } from "../../../app.service";
import { Consts } from "../../consts";
import { AuthUserService } from "../../../auth/auth-user.service";
import { Photo } from "../../../photos/photo.model";
import { Memory } from "../../../memories/memory.model";

@Component({
  selector: 'app-comment-add',
  templateUrl: './comment-add.component.html',
  styleUrls: ['./comment-add.component.css']
})
export class CommentAddComponent implements OnInit, OnDestroy {
  myForm: FormGroup;

  @Input() entity: Photo | Memory;

  constructor(private commentsService: CommentsService, private dialogService: DialogService, private appService: AppService, private authUserService: AuthUserService) {

  }

  getConsts() {
    return Consts;
  }

  onSubmit() {
    let retDialogSub = new EventEmitter<DialogRetEnum>();

    retDialogSub.subscribe(
      (buttonPressed: DialogRetEnum) => {
        if (buttonPressed === DialogRetEnum.ButtonOne) {
          const comment = new Comment(this.entity, this.myForm.value.comment, () => {
            this.appService.showToast(Consts.SUCCESS, "Comment added.");
            this.myForm.reset();
          });
          this.commentsService.commentSub.emit(comment);
        };
      });

    let message = "Do you really wish to add this comment?";
    this.dialogService.showDialog("Warning", message, "Yes", "No", retDialogSub);
  }

  ngOnInit() {

    this.myForm = new FormGroup({
      comment: new FormControl(null, Validators.required)
    });

  }

  ngOnDestroy() {

  }


  isFormValid() {
    let retVal = false;
    if (!this.authUserService.isGuestUser() && this.myForm.valid && this.myForm.dirty) {
      retVal = true
    }
    return retVal;
  }

}
