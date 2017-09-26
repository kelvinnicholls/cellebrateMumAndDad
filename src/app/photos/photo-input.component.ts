import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import {IMultiSelectSettings,IMultiSelectOption} from 'angular-2-dropdown-multiselect';
import * as moment from 'moment';
// https://www.npmjs.com/package/angular-2-dropdown-multiselect
// http://softsimon.github.io/angular-2-dropdown-multiselect/#
import { PhotoService } from "./photo.service";
import { UserService } from "../users/user.service";
import { ToastService } from "../shared/toast/toast.service";
import { TagService } from "../shared/tags/tag.service";
import { PersonService } from "../shared/people/person.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { CommentsService } from "../shared/comments/comments.service";
import { AppService } from "../app.service";
import { Photo } from "./photo.model";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Dialog } from "../shared/dialog/dialog.model";
import { Consts } from "../shared/consts";
import { FileStackService } from "../shared/file-stack/file-stack.service";
import { Comment } from "../shared/comments/comment.model";
import { Tag } from "../shared/tags/tag.model";
import { Person } from "../shared/people/person.model";
//import { element } from 'protractor';
import { Utils } from "../shared/utils/utils";

@Component({
    selector: 'app-photo-input',
    templateUrl: './photo-input.component.html',
    styleUrls: ['./photo-input.component.css'],
    providers: [ToastService]
})
export class PhotoInputComponent implements OnInit, OnDestroy {
    photo: Photo;
    _creator: string;
    myForm: FormGroup;
    private paramsSubscription: Subscription;
    private index: any;
    private commentSub: EventEmitter<Comment>;

    multiSelectSettings: IMultiSelectSettings = {
        enableSearch: true,
        //checkedStyle: 'fontawesome',
        //buttonClasses: 'btn btn-default btn-block',
        //dynamicTitleMaxItems: 3,
        //pullRight: true,
        showCheckAll: false,
        showUncheckAll: false,
        closeOnSelect: false
    };



    fileSource: String = Consts.FILE_SYSTEM;

    submitType = Consts.ADD_PHOTO;

    defaultFile = Consts.DEFAULT_PHOTO_PIC_FILE;

    photoData: any = null;
    photoFile: File = null;
    photoInfo: any = null;

    getIndex(): any {
        return this.index;
    }

    private findTag(id: string): string {
        let retVal = "";
        let option = this.tagService.multiSelectTagOptions.find((tag: IMultiSelectOption) => { return id == tag.id });
        if (option) {
            retVal = option.name;
        };
        return retVal;
    }

    private findPerson(id: string): string {
        let retVal = "";
        let option = this.personService.multiSelectPersonOptions.find((person: IMultiSelectOption) => { return id == person.id });
        if (option) {
            retVal = option.name;
        };
        return retVal;
    }

    addTag() {
        let retTagSub = new EventEmitter<Tag>();
        let photoInputComponent = this;
        retTagSub.subscribe((tag: Tag) => {
            if (tag) {
                photoInputComponent.tagService.multiSelectTagOptions.push({ id: tag.id, name: tag.tag });
                photoInputComponent.tagService.multiSelectTagOptions = photoInputComponent.tagService.multiSelectTagOptions.slice();
                photoInputComponent.tagService.multiSelectTagOptions = photoInputComponent.tagService.multiSelectTagOptions.sort(Utils.dynamicSort('name'));
                if (tag.autoSelect) {
                    photoInputComponent.tagService.selectedTags.push(tag.id);
                    photoInputComponent.myForm.get('tags').markAsDirty();
                };
            };
        });
        this.tagService.showAddTag(retTagSub);
    }

    getTags(): string {
        let tagsArr: String[] = [];
        let retVal = "No Tags";
        for (let index in this.tagService.selectedTags) {
            let tag = this.findTag(this.tagService.selectedTags[index]);
            tagsArr.push(tag);
        };
        if (tagsArr.length > 0) {
            retVal = tagsArr.join(", ");
        };
        return retVal;
    }

    addPerson() {
        let retPersonSub = new EventEmitter<Person>();
        let photoInputComponent = this;
        retPersonSub.subscribe((person: Person) => {
            if (person) {
                photoInputComponent.personService.multiSelectPersonOptions.push({ id: person.id, name: person.person });
                photoInputComponent.personService.multiSelectPersonOptions = photoInputComponent.personService.multiSelectPersonOptions.slice();
                photoInputComponent.personService.multiSelectPersonOptions = photoInputComponent.personService.multiSelectPersonOptions.sort(Utils.dynamicSort('name'));
                if (person.autoSelect) {
                    photoInputComponent.personService.selectedPeople.push(person.id);
                    photoInputComponent.myForm.get('people').markAsDirty();
                };
            };
        });
        this.personService.showAddPerson(retPersonSub);
    }

    getPeople(): string {
        let peopleArr: String[] = [];
        let retVal = "No People";
        for (let index in this.personService.selectedPeople) {
            let person = this.findPerson(this.personService.selectedPeople[index]);
            peopleArr.push(person);
        };
        if (peopleArr.length > 0) {
            retVal = peopleArr.join(", ");
        };
        return retVal;
    }

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
        , private tagService: TagService
        , private personService: PersonService
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

    modelMediaDate: NgbDateStruct;

    getMediaDate() {
        if (this.photo && this.photo.mediaDate) {
            let d = moment(this.photo && this.photo.mediaDate);
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
        this.commentsService.showComments("Comments for photo: '" + this.photo.title + "'", this.photo.comments);
    }


    onSubmit() {
        let retDialogSub = new EventEmitter<DialogRetEnum>();
        let photoInputComponent = this;

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    if (this.photo) {
                        // Edit       
                        photoInputComponent.photo = new Photo(
                            photoInputComponent.myForm.value.title,
                            photoInputComponent._creator,
                            null,
                            photoInputComponent.photo._id,
                            photoInputComponent.myForm.value.description,
                            photoInputComponent.photoFile,
                            photoInputComponent.photoInfo,
                            null,
                            null,
                            null,
                            photoInputComponent.myForm.value.tags,
                            null,
                            photoInputComponent.myForm.value.people,
                            this.ngbDateParserFormatter.formatForDB(this.myForm.value.mediaDate)
                        );
                        photoInputComponent.photoService.updatePhoto(this.photo)
                            .subscribe(
                            result => {
                                console.log(result);
                                photoInputComponent.router.navigate(['photos']).then((ok) => {
                                    if (ok) {
                                        photoInputComponent.photoService.showSuccessToast.emit("Photo updated.");
                                    };
                                });
                            }
                            );
                        photoInputComponent.photo = null;
                        photoInputComponent._creator = null;
                        photoInputComponent.photoData = null;
                        photoInputComponent.photoFile = null;
                        photoInputComponent.photoInfo = null;
                        photoInputComponent.submitType = Consts.ADD_PHOTO;

                    } else {
                        // Create
                        photoInputComponent.photo = new Photo(photoInputComponent.myForm.value.title,
                            photoInputComponent._creator,
                            null,
                            null,
                            photoInputComponent.myForm.value.description,
                            photoInputComponent.photoFile,
                            photoInputComponent.photoInfo,
                            null,
                            null,
                            null,
                            photoInputComponent.myForm.value.tags,
                            null,
                            photoInputComponent.myForm.value.people,
                            this.ngbDateParserFormatter.formatForDB(this.myForm.value.mediaDate));
                        photoInputComponent.photoService.addPhoto(photoInputComponent.photo)
                            .subscribe(
                            data => {
                                photoInputComponent.router.navigate(['photos']).then((ok) => {
                                    if (ok) {
                                        photoInputComponent.photoService.showSuccessToast.emit("Photo created.");
                                    };
                                });
                            },
                            error => console.error("PhotoComponent photoService.newPhoto error", error)
                            );
                        photoInputComponent.photo = null;
                        photoInputComponent._creator = null;
                        photoInputComponent.photoData = null;
                        photoInputComponent.photoFile = null;
                        photoInputComponent.photoInfo = null;
                        photoInputComponent.submitType = Consts.ADD_PHOTO;

                    };
                    photoInputComponent.myForm.reset();
                };
            });

        photoInputComponent.dialogService.showDialog("Warning", "Do you really wish to " + photoInputComponent.submitType + "?", "Yes", "No", retDialogSub);

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

    private extractIdsAsArray(arr: any[]): String[] {
        let retArr: String[] = [];
        for (let element of arr) {
            retArr.push(element.id);
        };
        return retArr;
    }

    ngOnInit() {
        let photoInputComponent = this;

        photoInputComponent.tagService.getTags().subscribe(
            (tags: Tag[]) => {
                photoInputComponent.tagService.multiSelectTagOptions = [];
                for (let tag of tags) {
                    photoInputComponent.tagService.multiSelectTagOptions.push({ id: tag.id, name: tag.tag });
                };
                console.log(photoInputComponent.tagService.multiSelectTagOptions);
            }
        );

        photoInputComponent.personService.getPeople().subscribe(
            (people: Person[]) => {
                photoInputComponent.personService.multiSelectPersonOptions = [];
                for (let person of people) {
                    photoInputComponent.personService.multiSelectPersonOptions.push({ id: person.id, name: person.person });
                };
                console.log(photoInputComponent.personService.multiSelectPersonOptions);
            }
        );

        photoInputComponent.commentSub = photoInputComponent.commentsService.commentSub
            .subscribe(
            (comment: Comment) => {
                if (comment.entity === Consts.PHOTO) {
                    photoInputComponent.photoService.addComment(photoInputComponent.photo, comment.comment, comment.entityIndex, comment.callback);
                };
            });

        photoInputComponent._creator = photoInputComponent.userService.getLoggedInUser()._creatorRef;

        photoInputComponent.myForm = new FormGroup({
            title: new FormControl(null, Validators.required,
                photoInputComponent.forbiddenTitles),
            description: new FormControl(null, null),
            tags: new FormControl(null, null),
            mediaDate: new FormControl(null, null),
            people: new FormControl(null, null)
        });


        if (photoInputComponent.route.snapshot.url.length === 2 && photoInputComponent.route.snapshot.url[0].path === 'photo' && photoInputComponent.route.snapshot.url[1].path === 'add') {
            photoInputComponent.submitType = Consts.ADD_PHOTO;
            photoInputComponent.clear();

        } else {
            photoInputComponent.paramsSubscription = photoInputComponent.route.params.subscribe(
                (queryParams: Params) => {
                    photoInputComponent.index = queryParams['index'];
                    photoInputComponent.photo = photoInputComponent.photoService.findPhotoByIndex(photoInputComponent.index);
                    photoInputComponent.modelMediaDate = this.getMediaDate();
                    photoInputComponent.submitType = Consts.UPDATE_PHOTO;
                    photoInputComponent.tagService.selectedTags = photoInputComponent.extractIdsAsArray(photoInputComponent.photo.tagsToDisplay);
                    photoInputComponent.personService.selectedPeople = photoInputComponent.extractIdsAsArray(photoInputComponent.photo.peopleToDisplay);
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


    onTagsChange() {
        //console.log(this.optionsModel);
    }

    onPeopleChange() {
        //console.log(this.optionsModel);
    }

}