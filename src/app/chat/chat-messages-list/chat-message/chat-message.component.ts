import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { ChatMessage } from "../../chat-message.model";
import { ChatService } from "../../chat.service";
import { DialogService } from "../../../shared/dialog/dialog.service";
import { DialogRetEnum } from "../../../shared/dialog/dialog-ret.enum";
import { Dialog } from "../../../shared/dialog/dialog.model";

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {

  @Input() chatMessage: ChatMessage;
  @Input() index: Number;


  ngOnInit() {
  }

  constructor(private chatService: ChatService, private dialogService: DialogService) { }


  onRemove() {
    let retDialogSub = new EventEmitter<DialogRetEnum>();

    retDialogSub.subscribe(
      (buttonPressed: DialogRetEnum) => {
        if (buttonPressed === DialogRetEnum.ButtonOne) {
          this.chatService.removeMessage(this.index);
        }
      });
    this.dialogService.showDialog("Warning", "Do you really wish to remove this message from the list?", "Yes", "No", retDialogSub);
  }

  public getSrc(location: String) {
    let retLoc = location;
    if (location.substring(0, 6) !== "images") {
      retLoc = location.substring(14);
    };
    return retLoc;
  }

}
