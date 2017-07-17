import { Component } from "@angular/core";
import { AuthService } from "./auth/auth.service";
import { AuthUserService } from "./auth/auth-user.service";
import { UserService } from "./users/user.service";
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    constructor(private authService: AuthService,private userService: UserService,private authUserService: AuthUserService) { }
}