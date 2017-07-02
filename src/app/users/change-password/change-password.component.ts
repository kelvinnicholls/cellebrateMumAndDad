import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { UserService } from "../user.service";
import { ToastService } from "../../shared/toast/toast.service";
import { User } from "../user.model";
import { Consts } from "../../shared/consts";
import { PasswordStrengthBarComponent } from '../../shared/password-strength-bar/password-strength-bar.component';
import { PasswordValidationService } from '../../shared/password-validation.service';

@Component({
    selector: 'change-password',
    templateUrl: './change-password.component.html',
    providers: [ToastService]
})
export class ChangePasswordComponent implements OnInit {
    user: User;
    myForm: FormGroup;

    constructor(private userService: UserService, private vcr: ViewContainerRef, private toastService: ToastService) {
        toastService.toast.setRootViewContainerRef(vcr);
    }


    onSubmit() {

        this.userService.changePassword(this.myForm.value.oldPassword, this.myForm.value.newPassword).subscribe(
            result => {
                this.toastService.showSuccess("Password updated.", { data: { url: '/' } });
                console.log(result);
            }
        );

        this.myForm.reset();
    }

    onClear() {
        this.myForm.reset();
    }

    ngOnInit() {

        this.myForm = new FormGroup({
            oldPassword: new FormControl(null, Validators.required),
            newPassword: new FormControl(null, [Validators.required, Validators.minLength(6), PasswordValidationService.oneLowercase, PasswordValidationService.oneUppercase])
        }, PasswordValidationService.matchingPasswords('oldPassword', 'newPassword'));

    }

    isFormValid() {
        return this.myForm.valid;
    }

}