import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DialogService } from "../../dialog/dialog.service";
import { DialogRetEnum } from "../../dialog/dialog-ret.enum";
import { Dialog } from "../../dialog/dialog.model";
import { ChatService } from "../chat.service";
import { AppService } from "../../app.service";
import { Consts } from "../../shared/consts";

@Component({
  selector: 'app-chat-send-message',
  templateUrl: './chat-send-message.component.html',
  styleUrls: ['./chat-send-message.component.css']
})
export class ChatSendMessageComponent implements OnInit {
  myForm: FormGroup;

  public sendAsAdmin : boolean = false;

  constructor(private chatService: ChatService, private dialogService: DialogService, private appService: AppService) {
    
  }

  onSubmit() {
    let retDialogSub = new EventEmitter<DialogRetEnum>();

    retDialogSub.subscribe(
      (buttonPressed: DialogRetEnum) => {
        if (buttonPressed === DialogRetEnum.ButtonOne) {
          this.chatService.createMessage(this.myForm.value.message,this.sendAsAdmin, () => {
            this.appService.showToast(Consts.SUCCESS, "Message sent.");
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

  }

  isFormValid() {
    return this.myForm.valid;
  }

}
