import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { PhotoService } from "./photo.service";
import { UserService } from "../users/user.service";
import { ToastService } from "../shared/toast/toast.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { CommentsService } from "../shared/comments/comments.service";
import { AppService } from "../app.service";
import { Photo } from "./photo.model";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Dialog } from "../shared/dialog/dialog.model";
import { Consts } from "../shared/consts";
import { FileStackService } from "../shared/file-stack/file-stack.service";
import { Comment } from "../shared/comments/comment.model";


@Component({
    selector: 'app-photo-input',
    templateUrl: './photo-input.component.html',
    providers: [ToastService]
})
export class PhotoInputComponent implements OnInit, OnDestroy {
    photo: Photo;
    _creator: string;
    myForm: FormGroup;
    private paramsSubscription: Subscription;
    private index: any;
    private commentSub: EventEmitter<Comment>;

    fileSource: String = Consts.FILE_SYSTEM;

    submitType = Consts.ADD_PHOTO;

    defaultFile = Consts.DEFAULT_PHOTO_PIC_FILE;

    photoData: any = null;
    photoFile: File = null;
    photoInfo: any = null;




    setFileSource(fileSource: String) {
        this.fileSource = fileSource;
    }

    getConsts() {
        return Consts;
    }


    getSource(): any {
        let retVal: any = this.defaultFile;

        if (this.photoInfo && this.photoInfo.location) {
            retVal = this.photoInfo.location;
        } else if (this.photoData) {
            retVal = this.photoData;
        } else if (this.photo && this.photo.photoInfo && this.photo.photoInfo.location) {
            retVal = this.photo.photoInfo.location;
        };

        return retVal;
    }

    showFileStackPicker() {
        if (this.fileSource === Consts.WEB) {
            let promise = this.fileStackService.showFilePicker({
                maxFiles: 1, fromSources: Consts.FILE_PICKER_SOURCES
            });
            promise.then((retObj) => {
                if (retObj.filesUploaded.length === 1) {
                    let file = retObj.filesUploaded[0];
                    const url = file.url;
                    const mimeType = file.mimetype;
                    let fileObj = { 'location': url, 'mimeType': mimeType, 'isUrl': true };
                    this.photoData = null;
                    this.photoFile = null;
                    this.photoInfo = fileObj;
                    this.myForm.markAsDirty();
                };
            });
        };
    }


    constructor(private ngbDateParserFormatter: NgbDateParserFormatter
        , private userService: UserService
        , private commentsService: CommentsService
        , private photoService: PhotoService
        , private route: ActivatedRoute
        , private vcr: ViewContainerRef
        , private toastService: ToastService
        , private dialogService: DialogService
        , private router: Router
        , private fileStackService: FileStackService
        , private appService: AppService) {
        toastService.toast.setRootViewContainerRef(vcr);
    }


    onImageChange(files: FileList) {
        let photoInputComponent = this;
        if (files.length == 1) {
            photoInputComponent.photoFile = files[0];
            if (photoInputComponent.photoFile && photoInputComponent.photoFile.name) {
                let fileExtension = photoInputComponent.photoFile.name.split('.').pop().toLowerCase();
                const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif'];
                if (allowedExtensions.indexOf(fileExtension) > -1) {
                    let photoInputComponent = this;
                    let fileReader: FileReader = new FileReader();
                    fileReader.readAsDataURL(photoInputComponent.photoFile);
                    fileReader.onloadend = function (e) {
                        photoInputComponent.photoData = fileReader.result;
                        photoInputComponent.photoInfo = null;
                        photoInputComponent.myForm.markAsDirty();
                    }
                }
            }
        }
    }


    isNewPhoto() {
        let retVal = this.photo ? false : true
        return retVal;
    }

    showComments() {
        this.commentsService.showComments("Comments for photo: '" + this.photo.title + "'",this.photo.comments );
    }


    onSubmit() {
        let retDialogSub = new EventEmitter<DialogRetEnum>();
        let photoInputComponent = this;

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    if (this.photo) {
                        // Edit       

                        this.photo = new Photo(
                            this.myForm.value.title,
                            this._creator,
                            null,
                            this.photo._id,
                            this.myForm.value.description,
                            this.photoFile,
                            this.photoInfo);
                        this.photoService.updatePhoto(this.photo)
                            .subscribe(
                            result => {
                                console.log(result);
                                photoInputComponent.toastService.showSuccess("Photo updated.");
                            }
                            );
                        this.photo = null;
                        this._creator = null;
                        this.photoData = null;
                        this.photoFile = null;
                        this.photoInfo = null;
                        this.submitType = Consts.ADD_PHOTO;

                    } else {
                        // Create
                        this.photo = new Photo(this.myForm.value.title,
                            this._creator,
                            null,
                            null,
                            this.myForm.value.description,
                            this.photoFile,
                            this.photoInfo);
                        this.photoService.addPhoto(this.photo)
                            .subscribe(
                            data => {
                                photoInputComponent.toastService.showSuccess("Photo created.");
                            },
                            error => console.error("PhotoComponent photoService.newPhoto error", error)
                            );
                        this.photo = null;
                        this._creator = null;
                        this.photoData = null;
                        this.photoFile = null;
                        this.photoInfo = null;
                        this.submitType = Consts.ADD_PHOTO;

                    }
                    this.myForm.reset();
                }
            });

        this.dialogService.showDialog("Warning", "Do you really wish to " + this.submitType + "?", "Yes", "No", retDialogSub);

    }

    clear() {
        this.submitType = Consts.ADD_PHOTO;
        this.photo = null;
        this._creator = null;
        this.photoData = null;
        this.photoFile = null;
        this.photoInfo = null;

        this.myForm.reset();

    }

    private getId() {
        let _id = null;
        if (this.photo && this.photo._id) {
            _id = this.photo._id;
        };
        return _id;
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

    forbiddenTitles = (control: FormControl): Promise<any> | Observable<any> => {
        return this.photoService.titleExists(control.value, this.getId());
    }


    ngOnInit() {

        this.commentSub = this.commentsService.commentSub
            .subscribe(
            (comment: Comment) => {
                if (comment.entity === Consts.PHOTO) {
                   this.photoService.addComment(this.photo,comment.comment,comment.callback);
                };
            });

        this._creator = this.userService.getLoggedInUser()._creatorRef;

        this.myForm = new FormGroup({
            title: new FormControl(null, Validators.required,
                this.forbiddenTitles),
            description: new FormControl(null, null)
        });


        if (this.route.snapshot.url.length === 2 && this.route.snapshot.url[0].path === 'photo' && this.route.snapshot.url[1].path === 'add') {
            this.submitType = Consts.ADD_PHOTO;
            this.clear();

        } else {
            this.paramsSubscription = this.route.params.subscribe(
                (queryParams: Params) => {
                    this.index = queryParams['index'];
                    this.photo = this.photoService.findPhotoByIndex(this.index);
                    this.submitType = Consts.UPDATE_PHOTO;
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
        this.destroy(this.commentSub);
    }

    isFormValid() {
        let retVal = false;
        if (this.myForm.valid && this.myForm.dirty && (this.photo || (!this.photo && (this.photoData || this.photoInfo)))) {
            retVal = true
        }
        return retVal;
    }


    isAddPhoto() {
        return this.submitType === Consts.ADD_PHOTO;
    }

}