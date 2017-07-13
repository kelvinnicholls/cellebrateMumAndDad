import { Component, OnInit } from '@angular/core';
import { ChatService } from "../chat.service";


@Component({
  selector: 'app-chat-messages-list',
  templateUrl: './chat-messages-list.component.html',
  styleUrls: ['./chat-messages-list.component.css']
})
export class ChatMessagesListComponent implements OnInit {

  constructor(private chatService: ChatService) { }

  ngOnInit() {
  }

}
