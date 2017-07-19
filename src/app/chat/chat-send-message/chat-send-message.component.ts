import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DialogService } from "../../dialog/dialog.service";
import { DialogRetEnum } from "../../dialog/dialog-ret.enum";
import { Dialog } from "../../dialog/dialog.model";
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ChatService } from "../chat.service";
import { AppService } from "../../app.service";
import { Consts } from "../../shared/consts";

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

  constructor(private chatService: ChatService, private dialogService: DialogService, private appService: AppService, private router: Router
    , private route: ActivatedRoute) {

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
    this.dialogService.showDialog("Warning", "Do you really wish to send this message?", "Yes", "No", retDialogSub);
  }

  onSendLocation() {
    let retDialogSub = new EventEmitter<DialogRetEnum>();

    retDialogSub.subscribe(
      (buttonPressed: DialogRetEnum) => {
        if (buttonPressed === DialogRetEnum.ButtonOne) {
          this.chatService.createLocationMessage(() => {
            this.appService.showToast(Consts.SUCCESS, "Location sent.");
            this.myForm.reset();
          });
        }
      });
    this.dialogService.showDialog("Warning", "Do you really wish to send your location?", "Yes", "No", retDialogSub);
  }


  ngOnInit() {


    this.myForm = new FormGroup({
      message: new FormControl(null, Validators.required)
    });


    this.paramsSubscription = this.route.params.subscribe(
      (queryParams: Params) => {
        this.socketId = queryParams['socketId'];
      }
    );
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }


  isFormValid() {
    return this.myForm.valid;
  }

}
