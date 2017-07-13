import { Component, OnInit, Input } from '@angular/core';
import { ChatMessage } from "../../chat-message.model";

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

}
