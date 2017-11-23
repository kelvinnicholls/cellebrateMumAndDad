import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DialogService } from "../../shared/dialog/dialog.service";
import { DialogRetEnum } from "../../shared/dialog/dialog-ret.enum";
import { Dialog } from "../../shared/dialog/dialog.model";
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ChatService } from "../chat.service";
import { ChatUser } from "../chat-user.model";
import { AppService } from "../../app.service";
import { Consts } from "../../shared/consts";
import { AuthUserService } from "../../auth/auth-user.service";

@Component({
  selector: 'app-chat-send-message',
  templateUrl: './chat-send-message.component.html',
  styleUrls: ['./chat-send-message.component.css']
})
export class ChatSendMessageComponent implements OnInit, OnDestroy {
  myForm: FormGroup;
  paramsSubscription: Subscription;
  public sendAsAdmin: boolean = false;
  public socketId: any;

  public heading = "";
  private chatUser: ChatUser = null;

  constructor(public chatService: ChatService, private dialogService: DialogService, private appService: AppService, private router: Router
    , private route: ActivatedRoute, private authUserService: AuthUserService) {

  }

  onSubmit() {
    let retDialogSub = new EventEmitter<DialogRetEnum>();

    retDialogSub.subscribe(
      (buttonPressed: DialogRetEnum) => {
        if (buttonPressed === DialogRetEnum.ButtonOne) {
          this.chatService.createMessage(this.myForm.value.message, this.sendAsAdmin, this.socketId, () => {
            this.appService.showToast(Consts.SUCCESS, "Message sent.");
            this.socketId = null;
            this.myForm.reset();
          });
        };
      });

    let message = "Do you really wish to send this message to all logged in users?";
    if (this.chatUser && this.chatUser.name) {
      message = "Do you really wish to send this message to " + this.chatUser.name + "?";
    }
    this.dialogService.showDialog("Warning", message, "Yes", "No", retDialogSub);
  }

  onSendLocation() {
    let retDialogSub = new EventEmitter<DialogRetEnum>();

    retDialogSub.subscribe(
      (buttonPressed: DialogRetEnum) => {
        if (buttonPressed === DialogRetEnum.ButtonOne) {
          this.chatService.createLocationMessage(this.socketId, () => {
            this.appService.showToast(Consts.SUCCESS, "Location sent.");
            this.myForm.reset();
          });
        }
      });

    let message = "Do you really wish to send your location to all logged in users?";
    if (this.chatUser && this.chatUser.name) {
      message = "Do you really wish to send your location to " + this.chatUser.name + "?";
    }
    this.dialogService.showDialog("Warning", message, "Yes", "No", retDialogSub);
  }


  ngOnInit() {
    this.myForm = new FormGroup({
      message: new FormControl(null, Validators.required)
    });


    this.paramsSubscription = this.route.params.subscribe(
      (queryParams: Params) => {
        this.socketId = queryParams['socketId'];
        this.chatUser = this.chatService.findChatUser(this.socketId);
        if (this.chatUser && this.chatUser.name && this.socketId) {
          this.heading = "Send message to user " + this.chatUser.name;

        } else {
          this.heading = "Send message to all users";
        }

      }
    );
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }

  isGuestUser(): Boolean {
    let retVal : Boolean = false;
    if (this.authUserService.isGuestUser()) {
      retVal = true;
    };
    return retVal; 
  }

  isFormValid(): Boolean {
    let retVal : Boolean = false;
    if (!this.authUserService.isGuestUser() && this.myForm.valid && this.myForm.dirty) {
      retVal = true;
    };
    return retVal; 
  }

}
