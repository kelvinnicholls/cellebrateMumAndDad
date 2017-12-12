import { Component, OnInit, Input } from '@angular/core';
import { ChatService } from "../chat.service";
import { ChatUser } from "../chat-user.model";

@Component({
  selector: 'app-chat-users',
  templateUrl: './chat-users.component.html',
  styleUrls: ['./chat-users.component.css']
})
export class ChatUsersComponent implements OnInit {

  @Input() chatUser: ChatUser;

  constructor(public chatService: ChatService) { }

  ngOnInit() {
  }

  public getSrc(location: String) {
    let retLoc = location;
    if (location.substring(0, 6) !== "images") {
      retLoc = location.substring(14);
    };
    return retLoc;
  }

}
