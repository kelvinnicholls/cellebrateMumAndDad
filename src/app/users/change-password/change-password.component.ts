import { Component, OnInit, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { UserService } from "../user.service";
import { AppService } from "../../app.service";
import { Router } from "@angular/router";
import { DialogService } from "../../shared/dialog/dialog.service";
import { DialogRetEnum } from "../../shared/dialog/dialog-ret.enum";
import { Dialog } from "../../shared/dialog/dialog.model";

import { Utils, LoglevelEnum, SortDataType } from "../../shared/utils/utils";
import { User } from "../user.model";
import { Consts } from "../../shared/consts";
import { PasswordStrengthBarComponent } from '../../shared/password-strength-bar/password-strength-bar.component';
import { PasswordValidationService } from '../../shared/password-validation.service';

@Component({
    selector: 'change-password',
    templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnInit {
    user: User;
    myForm: FormGroup;

    constructor(private userService: UserService, private appService: AppService, private router: Router, private dialogService: DialogService) {
    }


    onSubmit() {
        let retDialogSub = new EventEmitter<DialogRetEnum>();

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    this.userService.changePassword(this.myForm.value.oldPassword, this.myForm.value.newPassword).subscribe(
                        result => {
                            this.router.navigate(['']);
                            this.appService.showToast(Consts.SUCCESS, "Password updated.");
                            Utils.log(LoglevelEnum.Info,this,result);
                            this.myForm.reset();
                        }
                    );
                }
            });
        this.dialogService.showDialog("Warning", "Do you really wish to change your password?", "Yes", "No", retDialogSub);
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