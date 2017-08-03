import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { SignInUser } from "./sign-in-user.model";
import { AuthService } from "../../auth/auth.service";
import { ErrorService } from "../errors/error.service";
import { AppService } from "../../app.service";
import { ChatService } from "../../chat/chat.service";


import { PasswordStrengthBarComponent } from '../password-strength-bar/password-strength-bar.component';
import { PasswordValidationService } from '../password-validation.service';
import { Consts } from "../consts";

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit, OnDestroy {
    myForm: FormGroup;
    private authServiceSub: any;

    constructor(private authService: AuthService, private router: Router, private errorService: ErrorService, private appService: AppService, private chatService: ChatService) {
    }

    onSubmit() {
        const user = new SignInUser(this.myForm.value.email, this.myForm.value.password);
        let router = this.router;
        this.authServiceSub = this.authService.signIn(user)
            .subscribe((res: any) => {
                let payload = res.json();
                let headers = res.headers._headers;
                let userName = payload.name;
                localStorage.setItem(Consts.TOKEN, headers.get(Consts.X_AUTH)[0]);
                localStorage.setItem(Consts.LOGGED_IN_USER, JSON.stringify(payload));
                router.navigate(['']);
                this.appService.showToast(Consts.SUCCESS, "User signed in successfully.");
                this.chatService.connect(userName);
            }
            , (err) => {
                this.errorService.handleError(JSON.parse(err._body));
            });
        this.myForm.reset();
    }

    isFormValid() {
        return this.myForm.valid;
    }

    ngOnInit() {
        this.myForm = new FormGroup({
            email: new FormControl(null, [
                Validators.required,
                Validators.pattern(Consts.EMAIL_PATTERN)
            ]),
            password: new FormControl(null, Validators.required)
        });
    }

    destroy(sub: any) {
        if (sub) {
            sub.unsubscribe();
            sub = null;
        }
    }

    ngOnDestroy() {
        this.destroy(this.authServiceSub);
    }
}