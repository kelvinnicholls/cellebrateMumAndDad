import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateMomentParserFormatter } from '.././shared/ngb-date-moment-parser-formatter';
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
import { FileStackService } from "../shared/file-stack/file-stack.service";
import { Utils } from "../shared/utils/utils";
import { AuthUserService } from "../auth/auth-user.service";

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

    private mode: String;
    public isEditable: Boolean = false;

    checkIsEditable() {
        if (this.mode === Consts.ADD || (this.mode === Consts.EDIT && this.userService.getMode(this.user) != Consts.VIEW)) {
            this.isEditable = true;
        } else {
            this.isEditable = false;
        };
    }

    getTitle(): string {
        return Utils.initCap(this.mode) + " User";
    }

    fileSource: String = Consts.FILE_SYSTEM;

    submitType = Consts.CREATE_USER;

    defaultProfilePicFile = Consts.DEFAULT_PROFILE_PIC_FILE;

    profilePicData = null;
    profilePicFile: File = null;
    profilePicInfo: any = null;

    passwordValidators = [Validators.required, Validators.minLength(6), PasswordValidationService.oneLowercase, PasswordValidationService.oneUppercase];

    setFileSource(fileSource: String) {
        this.fileSource = fileSource;
    }

    getConsts() {
        return Consts;
    }

    // http://blogs.microsoft.co.il/gilf/2013/07/22/quick-tip-typescript-declare-keyword/
    // declare const filestack: {
    //     init(apiKey: string): {
    //         pick({ maxFiles }: { maxFiles: number }):
    //             Promise<{ filesUploaded: { url: string }[] }>
    //     }
    // };

    // uploadedFileUrls: string[] = [];

    // async showPicker() {
    //     const client = filestack.init(Consts.FILE_PICKER_API_KEY);
    //     const result = await client.pick({ maxFiles: 1 });
    //     const url = result.filesUploaded[0].url;
    //     this.uploadedFileUrls.push(url);
    // }

    showFileStackPicker() {
        if (this.fileSource === Consts.WEB) {
            let promise = this.fileStackService.showFilePicker({
                maxFiles: 1, fromSources: Consts.FILE_PICKER_SOURCES
            });
            promise.then((retObj) => {
                if (retObj.filesUploaded.length === 1) {
                    const url = retObj.filesUploaded[0].url;
                    const mimeType = retObj.filesUploaded[0].mimetype;
                    this.profilePicInfo = { 'location': url, 'mimeType': mimeType, 'isUrl': true };
                    this.profilePicData = null;
                    this.profilePicFile = null;
                    this.myForm.markAsDirty();
                };
            });
        };
    }

    getSource(): any {
        let retVal: any = this.defaultProfilePicFile;

        if (this.profilePicInfo && this.profilePicInfo.location) {
            retVal = this.profilePicInfo.location;
        } else if (this.profilePicData) {
            retVal = this.profilePicData;
        } else if (this.user && this.user.profilePicInfo && this.user.profilePicInfo.location) {
            retVal = this.user.profilePicInfo.location;
        };
        return retVal;
    }

    constructor(private ngbDateParserFormatter: NgbDateMomentParserFormatter
        , private userService: UserService
        , private route: ActivatedRoute
        , private vcr: ViewContainerRef
        , private toastService: ToastService
        , private dialogService: DialogService
        , private router: Router
        , private authUserService: AuthUserService
        , private fileStackService: FileStackService
        , private appService: AppService) {
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
        if (this.user && this.user.dob) {
            let d = moment(this.user && this.user.dob);
            return d.isValid() ? {
                year: d.year(),
                month: d.month() + 1,
                day: d.date()
            } : null;
        } else {
            return null;
        };
    }

    onImageChange(files: FileList) {
        let userInputComponent = this;
        if (files.length === 1) {
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
                        userInputComponent.profilePicInfo = null;
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
        let userInputComponent = this;

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    if (userInputComponent.user) {
                        // Edit       
                        let adminUser = userInputComponent.myForm.value.adminUser;
                        if (adminUser && typeof adminUser === 'string') {
                            adminUser = adminUser === 'Yes' ? true : false;
                        } else {
                            adminUser = userInputComponent.user.adminUser;
                        };
                        let guestUser = userInputComponent.myForm.value.guestUser;
                        if (guestUser && typeof guestUser === 'string') {
                            guestUser = guestUser === 'Yes' ? true : false;
                        } else {
                            guestUser = userInputComponent.user.guestUser;
                        };
                        let emailUpdates = userInputComponent.myForm.value.emailUpdates;
                        if (emailUpdates && typeof emailUpdates === 'string') {
                            emailUpdates = emailUpdates === 'Yes' ? true : false;
                        } else {
                            emailUpdates = userInputComponent.user.emailUpdates;
                        };
                        userInputComponent.user = new User(
                            userInputComponent.myForm.value.email,
                            null,
                            userInputComponent.myForm.value.name,
                            adminUser,
                            guestUser,
                            emailUpdates,
                            userInputComponent.myForm.value.relationship,
                            userInputComponent.ngbDateParserFormatter.formatForDB(userInputComponent.myForm.value.dob),
                            null, //this.myForm.value.twitterId,
                            null, //this.myForm.value.facebookId,
                            userInputComponent._creatorRef,
                            userInputComponent.profilePicFile,
                            userInputComponent.profilePicInfo);
                            userInputComponent.userService.updateUser(userInputComponent.user)
                            .subscribe(
                            result => {
                                console.log(result);

                                if (userInputComponent.submitType == Consts.UPDATE_CURRENT_USER) {
                                    userInputComponent.router.navigate(['']).then((ok) => {
                                        if (ok) {
                                            userInputComponent.appService.showToast(Consts.SUCCESS, "Logged In User updated.");
                                        };
                                    });


                                    //userInputComponent.router.navigate(['']);
                                    //userInputComponent.appService.showToast(Consts.SUCCESS, "Logged In User updated.");
                                } else {
                                    userInputComponent.router.navigate(['users']).then((ok) => {
                                        if (ok) {
                                            userInputComponent.userService.showSuccessToast.emit("User updated");
                                        };
                                    });
                                    //userInputComponent.toastService.showSuccess("User updated.");
                                    //userInputComponent.router.navigate(['users']);
                                };
                            }
                            );
                            userInputComponent.user = null;
                            userInputComponent._creatorRef = null;
                            userInputComponent.profilePicData = null;
                            userInputComponent.profilePicFile = null;
                            userInputComponent.profilePicInfo = null;
                            userInputComponent.submitType = Consts.CREATE_USER;

                    } else {
                        // Create
                        userInputComponent.user = new User(
                            userInputComponent.myForm.value.email,
                            userInputComponent.myForm.value.password,
                            userInputComponent.myForm.value.name,
                            userInputComponent.myForm.value.adminUser == 'Yes' ? true : false,
                            userInputComponent.myForm.value.guestUser == 'Yes' ? true : false,
                            userInputComponent.myForm.value.emailUpdates == 'Yes' ? true : false,
                            userInputComponent.myForm.value.relationship,
                            userInputComponent.ngbDateParserFormatter.formatForDB(this.myForm.value.dob),
                            null, //this.myForm.value.twitterId,
                            null, //this.myForm.value.facebookId,
                            null,
                            userInputComponent.profilePicFile,
                            userInputComponent.profilePicInfo);
                            userInputComponent.userService.addUser(this.user)
                            .subscribe(
                            data => {
                                userInputComponent.router.navigate(['users']).then((ok) => {
                                    if (ok) {
                                        userInputComponent.userService.showSuccessToast.emit("User created");
                                    };
                                });
                                // userInputComponent.toastService.showSuccess("User created.");
                                // userInputComponent.router.navigate(['users']);
                            },
                            error => console.error("UserInputComponent userService.newUser error", error)
                            );
                            userInputComponent.user = null;
                            userInputComponent._creatorRef = null;
                            userInputComponent.profilePicData = null;
                            userInputComponent.profilePicFile = null;
                            userInputComponent.profilePicInfo = null;
                            userInputComponent.submitType = Consts.CREATE_USER;
                    }
                    userInputComponent.myForm.reset();
                }
            });

            userInputComponent.dialogService.showDialog("Warning", "Do you really wish to " + userInputComponent.submitType + "?", "Yes", "No", retDialogSub);

    }

    clear() {
        this.submitType = Consts.CREATE_USER;
        this.user = null;
        this._creatorRef = null;
        this.profilePicData = null;
        this.profilePicFile = null;
        this.profilePicInfo = null;

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


    createForm(mode: String) {
        let userInputComponent = this;
        let formState = null;
        if (mode != Consts.ADD) {
            formState = { value: '', disabled: !userInputComponent.isEditable };
        };
        userInputComponent.myForm = new FormGroup({
            name: new FormControl(formState, Validators.required,
                userInputComponent.forbiddenNames),
            adminUser: new FormControl(formState, Validators.required),
            guestUser: new FormControl(formState, Validators.required),
            emailUpdates: new FormControl(formState, Validators.required),
            relationship: new FormControl(formState, Validators.required),
            email: new FormControl(formState, [
                Validators.required,
                Validators.pattern(Consts.EMAIL_PATTERN)],
                userInputComponent.forbiddenEmails
            ),
            password: new FormControl(formState, userInputComponent.passwordValidators),
            dob: new FormControl(formState, null)
        });
    }


    ngOnInit() {
        let userInputComponent = this;

        if (userInputComponent.route.snapshot.url.length === 2 && userInputComponent.route.snapshot.url[0].path === 'user' && userInputComponent.route.snapshot.url[1].path === 'edit-me') {
            userInputComponent.submitType = Consts.UPDATE_CURRENT_USER;
            userInputComponent.mode = Consts.EDIT;
            userInputComponent.userService.getMe().subscribe(
                (user: User) => {
                    userInputComponent.user = user;
                    userInputComponent.modelDob = userInputComponent.getDob();
                    userInputComponent._creatorRef = user._creatorRef;
                    if (typeof userInputComponent.user.adminUser === 'boolean') {
                        userInputComponent.user.adminUser = userInputComponent.user.adminUser ? 'Yes' : 'No';
                    };
                    if (typeof userInputComponent.user.guestUser === 'boolean') {
                        userInputComponent.user.guestUser = userInputComponent.user.guestUser ? 'Yes' : 'No';
                    };
                    if (typeof userInputComponent.user.emailUpdates === 'boolean') {
                        userInputComponent.user.emailUpdates = userInputComponent.user.emailUpdates ? 'Yes' : 'No';
                    };
                    userInputComponent.checkIsEditable();
                    userInputComponent.createForm(userInputComponent.mode);
                    userInputComponent.myForm.get('password').clearValidators();
                    userInputComponent.myForm.get('password').updateValueAndValidity();
                    userInputComponent.myForm.get('adminUser').disable();
                    userInputComponent.myForm.get('adminUser').updateValueAndValidity();
                }
            );
        } else if (userInputComponent.route.snapshot.url.length === 2 && userInputComponent.route.snapshot.url[0].path === 'user' && userInputComponent.route.snapshot.url[1].path === 'create') {
            userInputComponent.submitType = Consts.CREATE_USER;
            userInputComponent.mode = Consts.ADD;
            userInputComponent.checkIsEditable();
            userInputComponent.createForm(userInputComponent.mode);
            userInputComponent.clear();
        } else {
            userInputComponent.paramsSubscription = userInputComponent.route.params.subscribe(
                (queryParams: Params) => {
                    userInputComponent.index = queryParams['index'];
                    userInputComponent.user = userInputComponent.userService.findUserByIndex(userInputComponent.index);
                    userInputComponent.modelDob = userInputComponent.getDob();
                    userInputComponent.submitType = Consts.UPDATE_USER;
                    userInputComponent.mode = Consts.EDIT;
                    userInputComponent._creatorRef = userInputComponent.user._creatorRef;
                    if (typeof userInputComponent.user.adminUser === 'boolean') {
                        userInputComponent.user.adminUser = userInputComponent.user.adminUser ? 'Yes' : 'No';
                    };
                    if (typeof userInputComponent.user.emailUpdates === 'boolean') {
                        userInputComponent.user.emailUpdates = userInputComponent.user.emailUpdates ? 'Yes' : 'No';
                    };
                    userInputComponent.checkIsEditable();
                    userInputComponent.createForm(userInputComponent.mode);

                    userInputComponent.myForm.get('password').clearValidators();
                    userInputComponent.myForm.get('password').updateValueAndValidity();
                    userInputComponent.myForm.get('adminUser').enable();
                    userInputComponent.myForm.get('adminUser').updateValueAndValidity();
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
        let retVal = false;
        if (!this.authUserService.isGuestUser() && this.myForm.valid && this.myForm.dirty) {
            retVal = true
        }
        return retVal;
    }


    isCreateUser() {
        return this.submitType === Consts.CREATE_USER;
    }

}