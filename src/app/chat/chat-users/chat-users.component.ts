import { Component, OnInit } from '@angular/core';
import { ChatService } from "../chat.service"

@Component({
  selector: 'app-chat-users',
  templateUrl: './chat-users.component.html',
  styleUrls: ['./chat-users.component.css']
})
export class ChatUsersComponent implements OnInit {

  constructor(private chatService : ChatService) { }

  ngOnInit() {
  }

}
