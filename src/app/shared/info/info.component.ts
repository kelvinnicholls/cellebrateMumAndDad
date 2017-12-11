import { Component } from '@angular/core';
import { AuthUserService } from "../../auth/auth-user.service";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent {

  constructor(public authUserService: AuthUserService) { }
}
