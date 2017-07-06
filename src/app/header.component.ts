import { Component } from "@angular/core";
import { AuthService } from "./auth/auth.service";
import { UserService } from "./users/user.service";
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    constructor(private authService: AuthService,private userService: UserService) { }
}