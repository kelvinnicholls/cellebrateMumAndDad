import { Component, OnInit, EventEmitter } from '@angular/core';
import { ChatService } from "../chat.service";
import { DialogService } from "../../shared/dialog/dialog.service";
import { DialogRetEnum } from "../../shared/dialog/dialog-ret.enum";
import { Dialog } from "../../shared/dialog/dialog.model";

@Component({
  selector: 'app-chat-messages-list',
  templateUrl: './chat-messages-list.component.html',
  styleUrls: ['./chat-messages-list.component.css']
})
export class ChatMessagesListComponent implements OnInit {

  constructor(public chatService: ChatService, private dialogService: DialogService) { }

  ngOnInit() {
  }

  onClearMessages() {
    let retDialogSub = new EventEmitter<DialogRetEnum>();

    retDialogSub.subscribe(
      (buttonPressed: DialogRetEnum) => {
        if (buttonPressed === DialogRetEnum.ButtonOne) {
          this.chatService.clearMessages();
        }
      });
    this.dialogService.showDialog("Warning", "Do you really wish to clear all chat messages?", "Yes", "No", retDialogSub);
  }


}
