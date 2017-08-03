import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

import { PasswordStrengthBarComponent } from '../shared/password-strength-bar/password-strength-bar.component';
import { PasswordValidationService } from '../shared/password-validation.service';
import { UserService } from "./user.service";
import { ToastService } from "../shared/toast/toast.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { AppService } from "../app.service";
import { User } from "./user.model";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Dialog } from "../shared/dialog/dialog.model";
import { Consts } from "../shared/consts";


@Component({
    selector: 'app-user-input',
    templateUrl: './user-input.component.html',
    providers: [ToastService]
})
export class UserInputComponent implements OnInit, OnDestroy {
    user: User;
    _creatorRef: string;
    myForm: FormGroup;
    private paramsSubscription: Subscription;
    private index: any;

    password = "";
    email = "";

    submitType = Consts.CREATE_USER;

    defaultProfilePicFile = Consts.DEFAULT_PROFILE_PIC_FILE;
    profilePicData = null;
    profilePicFile: File = null;

    passwordValidators = [Validators.required, Validators.minLength(6), PasswordValidationService.oneLowercase, PasswordValidationService.oneUppercase];



    constructor(private ngbDateParserFormatter: NgbDateParserFormatter, private userService: UserService, private route: ActivatedRoute, private vcr: ViewContainerRef, private toastService: ToastService, private dialogService: DialogService, private router: Router,, private appService: AppService) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    getMaxDate() {
        let d = moment();
        return d.isValid() ? {
            year: d.year(),
            month: d.month() + 1,
            day: d.date()
        } : null;
    }


    getMinDate() {
        let d = moment();
        d.subtract(100, 'years');
        return d.isValid() ? {
            year: d.year(),
            month: d.month() + 1,
            day: d.date()
        } : null;
    }

    modelDob: NgbDateStruct;

    getDob() {
        let d = moment(this.user && this.user.dob);
        return d.isValid() ? {
            year: d.year(),
            month: d.month() + 1,
            day: d.date()
        } : null;
    }

    onImageChange(files: FileList) {
        let userInputComponent = this;
        if (files.length > 0) {
            userInputComponent.profilePicFile = files[0];
            if (userInputComponent.profilePicFile && this.profilePicFile.name) {
                let fileExtension = userInputComponent.profilePicFile.name.split('.').pop().toLowerCase();
                const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif'];
                if (allowedExtensions.indexOf(fileExtension) > -1) {
                    let userInputComponent = this;
                    let fileReader: FileReader = new FileReader();
                    fileReader.readAsDataURL(this.profilePicFile);
                    fileReader.onloadend = function (e) {
                        userInputComponent.profilePicData = fileReader.result;
                        userInputComponent.myForm.markAsDirty();
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
        let retDialogSub = new EventEmitter<DialogRetEnum>();

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    if (this.user) {
                        // Edit       
                        let adminUser = this.myForm.value.adminUser;
                        if (adminUser && typeof adminUser === 'string') {
                            adminUser = adminUser === 'Yes' ? true : false;
                        } else {
                            adminUser = this.user.adminUser;
                        };
                        let emailUpdates = this.myForm.value.emailUpdates;
                        if (emailUpdates && typeof emailUpdates === 'string') {
                            emailUpdates = emailUpdates === 'Yes' ? true : false;
                        } else {
                            emailUpdates = this.user.emailUpdates;
                        };
                        this.user = new User(
                            this.myForm.value.email,
                            null,
                            this.myForm.value.name,
                            adminUser,
                            emailUpdates,
                            this.myForm.value.relationship,
                            this.ngbDateParserFormatter.formatForDB(this.myForm.value.dob),
                            this.myForm.value.twitterId,
                            this.myForm.value.facebookId,
                            this._creatorRef,
                            this.profilePicFile);
                        this.userService.updateUser(this.user)
                            .subscribe(
                            result => {
                                console.log(result);
                                if (this.submitType == Consts.UPDATE_CURRENT_USER) {
                                    this.router.navigate(['']);
                                    this.appService.showToast(Consts.SUCCESS, "Logged In User updated.");
                                } else {
                                    this.toastService.showSuccess("User updated.");
                                };
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
                            this.myForm.value.emailUpdates == 'Yes' ? true : false,
                            this.myForm.value.relationship,
                            this.ngbDateParserFormatter.formatForDB(this.myForm.value.dob),
                            this.myForm.value.twitterId,
                            this.myForm.value.facebookId,
                            null,
                            this.profilePicFile);
                        this.userService.addUser(this.user)
                            .subscribe(
                            data => {
                                this.toastService.showSuccess("User created.");
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
            });

        this.dialogService.showDialog("Warning", "Do you really wish to " + this.submitType + "?", "Yes", "No", retDialogSub);

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
        if (this.myForm.dirty) {
            let retDialogSub = new EventEmitter<DialogRetEnum>();

            retDialogSub.subscribe(
                (buttonPressed: DialogRetEnum) => {
                    if (buttonPressed === DialogRetEnum.ButtonOne) {
                        this.clear();
                    }
                });
            this.dialogService.showDialog("Warning", "Do you really wish to Clear the form without saving your changes?", "Yes", "No", retDialogSub);
        } else {
            this.clear();
        }
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

        this.myForm = new FormGroup({
            name: new FormControl(null, Validators.required,
                this.forbiddenNames),
            adminUser: new FormControl(null, Validators.required),
            emailUpdates: new FormControl(null, Validators.required),
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
                    this.modelDob = this.getDob();
                    this._creatorRef = user._creatorRef;
                    if (typeof this.user.adminUser === 'boolean') {
                        this.user.adminUser = this.user.adminUser ? 'Yes' : 'No';
                    };
                    if (typeof this.user.emailUpdates === 'boolean') {
                        this.user.emailUpdates = this.user.emailUpdates ? 'Yes' : 'No';
                    };
                    this.myForm.get('password').clearValidators();
                    this.myForm.get('password').updateValueAndValidity();
                    this.myForm.get('adminUser').disable();
                    this.myForm.get('adminUser').updateValueAndValidity();
                }
            );
        } else if (this.route.snapshot.url.length === 2 && this.route.snapshot.url[0].path === 'user' && this.route.snapshot.url[1].path === 'create') {
            this.submitType = Consts.CREATE_USER;
            this.clear();

        } else {
            this.paramsSubscription = this.route.params.subscribe(
                (queryParams: Params) => {
                    this.index = queryParams['index'];
                    this.user = this.userService.findUserByIndex(this.index);
                    this.modelDob = this.getDob();
                    this.submitType = Consts.UPDATE_USER;
                    this._creatorRef = this.user._creatorRef;
                    if (typeof this.user.adminUser === 'boolean') {
                        this.user.adminUser = this.user.adminUser ? 'Yes' : 'No';
                    };
                    if (typeof this.user.emailUpdates === 'boolean') {
                        this.user.emailUpdates = this.user.emailUpdates ? 'Yes' : 'No';
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
        this.destroy(this.paramsSubscription);
    }

    isFormValid() {
        return this.myForm.valid && this.myForm.dirty;

    }


    isCreateUser() {
        return this.submitType === Consts.CREATE_USER;
    }

}