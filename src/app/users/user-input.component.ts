import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';


import { UserService } from "./user.service";
import { ToastService } from "../shared/toast/toast.service";
import { User } from "./user.model";
import { Consts } from "../shared/consts";

import { PasswordStrengthBarComponent } from '../shared/password-strength-bar/password-strength-bar.component';
import { PasswordValidationService } from '../shared/password-validation.service';


@Component({
    selector: 'app-user-input',
    templateUrl: './user-input.component.html',
    providers: [ToastService]
})
export class UserInputComponent implements OnInit, OnDestroy {
    user: User;
    _creatorRef: string;
    myForm: FormGroup;
    private clearUserInputSub: any;
    private userIsEditSub: any;

    password = "";
    email = "";

    submitType = Consts.CREATE_USER;

    defaultProfilePicFile = Consts.DEFAULT_PROFILE_PIC_FILE;
    profilePicData = null;
    profilePicFile: File = null;

    passwordValidators = [Validators.required, Validators.minLength(6), PasswordValidationService.oneLowercase, PasswordValidationService.oneUppercase];



    constructor(private userService: UserService, private route: ActivatedRoute, private vcr: ViewContainerRef, private toastService: ToastService) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    onImageChange(files: FileList) {
        if (files.length > 0) {
            this.profilePicFile = files[0];
            if (this.profilePicFile && this.profilePicFile.name) {
                let fileExtension = this.profilePicFile.name.split('.').pop().toLowerCase();
                const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif'];
                if (allowedExtensions.indexOf(fileExtension) > -1) {
                    let userInputComponent = this;
                    let fileReader: FileReader = new FileReader();
                    fileReader.readAsDataURL(this.profilePicFile);
                    fileReader.onloadend = function (e) {
                        userInputComponent.profilePicData = fileReader.result;
                    }
                }
            }
        }
    }

    isNewUser() {
        let retVal = this.user ? false : true
        return retVal;
    }

    onSubmit() {
        if (this.user) {
            // Edit
            this.user = new User(
                this.myForm.value.email,
                null,
                this.myForm.value.name,
                this.myForm.value.adminUser == 'Yes' ? true : false,
                this.myForm.value.relationship,
                this.myForm.value.dob,
                this.myForm.value.twitterId,
                this.myForm.value.facebookId,
                this._creatorRef,
                this.profilePicFile);
            this.userService.updateUser(this.user)
                .subscribe(
                result => {
                    this.toastService.showSuccess("User updated.");
                    console.log(result);
                    this.userService.showUserInput.emit(false);
                    this.userService.selectedUserIndex.emit(-1);
                }
                );
            this.user = null;
            this._creatorRef = null;
            this.profilePicData = null;
            this.profilePicFile = null;
        } else {
            // Create
            this.user = new User(
                this.myForm.value.email,
                this.myForm.value.password,
                this.myForm.value.name,
                this.myForm.value.adminUser == 'Yes' ? true : false,
                this.myForm.value.relationship,
                this.myForm.value.dob,
                this.myForm.value.twitterId,
                this.myForm.value.facebookId,
                null,
                this.profilePicFile);
            this.userService.addUser(this.user)
                .subscribe(
                data => {
                    this.toastService.showSuccess("User created.");
                    this.userService.showUserInput.emit(false);
                    this.userService.selectedUserIndex.emit(-1);
                },
                error => console.error("UserComponent userService.newUser error", error)
                );
            this.user = null;
            this._creatorRef = null;
            this.profilePicData = null;
            this.profilePicFile = null;
        }
        this.myForm.reset();
    }



    clear() {
        this.submitType = Consts.CREATE_USER;
        this.user = null;
        this._creatorRef = null;
        this.profilePicData = null;
        this.profilePicFile = null;
        this.myForm.reset();
        this.myForm.get('password').setValidators(this.passwordValidators);
        this.myForm.get('password').updateValueAndValidity();
        this.myForm.get('adminUser').enable();
        this.myForm.get('adminUser').updateValueAndValidity();
    }

    onClear() {
        this.clear();
        this.userService.selectedUserIndex.emit(-1);
    }

    private getCreatorRef() {
        let _creatorRef = null;
        if (this.user && this.user._creatorRef) {
            _creatorRef = this.user._creatorRef;
        };
        return _creatorRef;
    }

    forbiddenEmails = (control: FormControl): Promise<any> | Observable<any> => {
        return this.userService.emailExists(control.value, this.getCreatorRef());
    }

    forbiddenNames = (control: FormControl): Promise<any> | Observable<any> => {
        return this.userService.nameExists(control.value, this.getCreatorRef());
    }

    ngOnInit() {

        this.clearUserInputSub = this.userService.clearUserInput.subscribe(
            (clear: Boolean) => {
                if (clear) {
                    this.clear();
                }

            }
        );

        this.myForm = new FormGroup({
            name: new FormControl(null, Validators.required,
                this.forbiddenNames),
            adminUser: new FormControl(null, Validators.required),
            relationship: new FormControl(null, Validators.required),
            email: new FormControl(null, [
                Validators.required,
                Validators.pattern(Consts.EMAIL_PATTERN)],
                this.forbiddenEmails
            ),
            password: new FormControl(null, this.passwordValidators),
            dob: new FormControl(null, null),
            twitterId: new FormControl(null, null),
            facebookId: new FormControl(null, null)
        });


        if (this.route.snapshot.url.length === 2 && this.route.snapshot.url[0].path === 'user' && this.route.snapshot.url[1].path === 'edit-me') {
            this.submitType = Consts.UPDATE_CURRENT_USER;
            this.userService.getMe().subscribe(
                (user: User) => {
                    this.user = user;
                    this._creatorRef = user._creatorRef;
                    if (typeof this.user.adminUser === 'boolean') {
                        this.user.adminUser = this.user.adminUser ? 'Yes' : 'No';
                    };
                    this.myForm.get('password').clearValidators();                    
                    this.myForm.get('password').updateValueAndValidity();
                    this.myForm.get('adminUser').disable();
                    this.myForm.get('adminUser').updateValueAndValidity();
                }
            );
        } else {
            this.userIsEditSub = this.userService.userIsEdit.subscribe(
                (user: User) => {
                    this.submitType = Consts.UPDATE_USER;
                    this.user = user;
                    this._creatorRef = user._creatorRef;
                    if (typeof this.user.adminUser === 'boolean') {
                        this.user.adminUser = this.user.adminUser ? 'Yes' : 'No';
                    };
                    this.myForm.get('password').clearValidators();
                    this.myForm.get('password').updateValueAndValidity();
                    this.myForm.get('adminUser').enable();
                    this.myForm.get('adminUser').updateValueAndValidity();
                }
            );
        };
    }

    destroy(sub: any) {
        if (sub) {
            sub.unsubscribe();
            sub = null;
        }
    }

    ngOnDestroy() {
        this.destroy(this.clearUserInputSub);
        this.destroy(this.userIsEditSub);
    }

    isFormValid() {
        return this.myForm.valid;
    }

    onExit() {
        this.clear();
        this.userService.selectedUserIndex.emit(-1);
        this.userService.showUserInput.emit(false);
    }
}