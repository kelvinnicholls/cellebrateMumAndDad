import { Component,ViewContainerRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { SignInUser } from "./sign-in-user.model";
import { AuthService } from "./auth.service";
import { ErrorService } from "../errors/error.service";
import { ToastService } from "../shared/toast/toast.service";


import { PasswordStrengthBarComponent } from '../shared/password-strength-bar/password-strength-bar.component';
import { PasswordValidationService } from '../shared/password-validation.service';
import { Consts } from "../shared/consts";

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls : ['./sign-in.component.css'],
    providers: [ToastService]
})
export class SignInComponent {
    myForm: FormGroup;

    constructor(private authService: AuthService, private router: Router, private errorService: ErrorService, private vcr: ViewContainerRef, private toastService: ToastService) { 
        toastService.toast.setRootViewContainerRef(vcr);
    }

    onSubmit() {
        const user = new SignInUser(this.myForm.value.email, this.myForm.value.password);
        let router = this.router;
        this.authService.signIn(user)
            .subscribe((res : any) => {
                let payload = res.json();
                let headers = res.headers._headers;
                localStorage.setItem(Consts.TOKEN, headers.get(Consts.X_AUTH)[0]);
                localStorage.setItem(Consts.LOGGED_IN_USER, JSON.stringify(payload));
                this.toastService.showSuccess("User signed in successfully.",{data: {url: '/'}});
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
}