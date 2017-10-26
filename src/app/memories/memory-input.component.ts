import { Component, OnInit, OnDestroy, ViewContainerRef, ViewChild, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { IMultiSelectSettings, IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import * as moment from 'moment';
// https://www.npmjs.com/package/angular-2-dropdown-multiselect
// http://softsimon.github.io/angular-2-dropdown-multiselect/#
import { MemoryService } from "./memory.service";
import { PhotoService } from "../photos/photo.service";
import { UserService } from "../users/user.service";
import { ToastService } from "../shared/toast/toast.service";
import { TagService } from "../shared/tags/tag.service";
import { PersonService } from "../shared/people/person.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { CommentsService } from "../shared/comments/comments.service";
import { AppService } from "../app.service";
import { Memory } from "./memory.model";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Dialog } from "../shared/dialog/dialog.model";
import { Consts } from "../shared/consts";
import { FileStackService } from "../shared/file-stack/file-stack.service";
import { Comment, CommentDisplay } from "../shared/comments/comment.model";
import { Tag } from "../shared/tags/tag.model";
import { Person } from "../shared/people/person.model";
//import { element } from 'protractor';
import { Utils } from "../shared/utils/utils";

@Component({
    selector: 'app-memory-input',
    templateUrl: './memory-input.component.html',
    styleUrls: ['./memory-input.component.css'],
    providers: [ToastService]
})
export class MemoryInputComponent implements OnInit, OnDestroy {
    memory: Memory;
    _creator: string;
    myForm: FormGroup;
    private paramsSubscription: Subscription;
    private index: any;
    private commentSub: EventEmitter<Comment>;
    private commentAddedSub: EventEmitter<Comment>;
    

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





    submitType = Consts.ADD_MEMORY;


    getIndex(): any {
        return this.index;
    }

    private findTag(id: String): String {
        let retVal = "";
        let option = this.tagService.multiSelectTagOptions.find((tag: IMultiSelectOption) => { return id == tag.id });
        if (option) {
            retVal = option.name;
        };
        return retVal;
    }

    private findPerson(id: String): String {
        let retVal = "";
        let option = this.personService.multiSelectPersonOptions.find((person: IMultiSelectOption) => { return id == person.id });
        if (option) {
            retVal = option.name;
        };
        return retVal;
    }

    addTag() {
        let retTagSub = new EventEmitter<Tag>();
        let memoryInputComponent = this;
        retTagSub.subscribe((tag: Tag) => {
            if (tag) {
                memoryInputComponent.tagService.multiSelectTagOptions.push({ id: tag.id, name: tag.tag });
                memoryInputComponent.tagService.multiSelectTagOptions = memoryInputComponent.tagService.multiSelectTagOptions.slice();
                memoryInputComponent.tagService.multiSelectTagOptions = memoryInputComponent.tagService.multiSelectTagOptions.sort(Utils.dynamicSort('name'));
                if (tag.autoSelect) {
                    memoryInputComponent.tagService.selectedTags.push(tag.id);
                    memoryInputComponent.myForm.get('tags').markAsDirty();
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
        let memoryInputComponent = this;
        retPersonSub.subscribe((person: Person) => {
            if (person) {
                memoryInputComponent.personService.multiSelectPersonOptions.push({ id: person.id, name: person.person });
                memoryInputComponent.personService.multiSelectPersonOptions = memoryInputComponent.personService.multiSelectPersonOptions.slice();
                memoryInputComponent.personService.multiSelectPersonOptions = memoryInputComponent.personService.multiSelectPersonOptions.sort(Utils.dynamicSort('name'));
                if (person.autoSelect) {
                    memoryInputComponent.personService.selectedPeople.push(person.id);
                    memoryInputComponent.myForm.get('people').markAsDirty();
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

    getConsts() {
        return Consts;
    }





    constructor(private ngbDateParserFormatter: NgbDateParserFormatter
        , private userService: UserService
        , private tagService: TagService
        , private personService: PersonService
        , private photoService: PhotoService
        , private commentsService: CommentsService
        , private memoryService: MemoryService
        , private route: ActivatedRoute
        , private vcr: ViewContainerRef
        , private toastService: ToastService
        , private dialogService: DialogService
        , private router: Router
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
        if (this.memory && this.memory.mediaDate) {
            let d = moment(this.memory && this.memory.mediaDate);
            return d.isValid() ? {
                year: d.year(),
                month: d.month() + 1,
                day: d.date()
            } : null;
        } else {
            return null;
        };
    }




    isNewMemory() {
        let retVal = this.memory ? false : true
        return retVal;
    }

    showComments() {
        this.commentsService.showComments("Comments for memory: '" + this.memory.title + "'", this.memory.comments);
    }


    onSubmit() {
        let retDialogSub = new EventEmitter<DialogRetEnum>();
        let memoryInputComponent = this;

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    if (this.memory) {
                        // Edit       
                        memoryInputComponent.memory = new Memory(
                            memoryInputComponent.myForm.value.title,
                            memoryInputComponent.memory._creator,
                            null,
                            memoryInputComponent.memory._id,
                            memoryInputComponent.myForm.value.description,
                            memoryInputComponent.myForm.value.photos,
                            null,
                            null,
                            null,
                            memoryInputComponent.myForm.value.tags,
                            null,
                            memoryInputComponent.myForm.value.people,
                            this.ngbDateParserFormatter.formatForDB(this.myForm.value.mediaDate)
                        );
                        memoryInputComponent.memoryService.updateMemory(this.memory)
                            .subscribe(
                            result => {
                                console.log(result);
                                memoryInputComponent.router.navigate(['memories']).then((ok) => {
                                    if (ok) {
                                        memoryInputComponent.memoryService.showSuccessToast.emit("Memory updated.");
                                    };
                                });
                            }
                            );
                        memoryInputComponent.memory = null;
                        memoryInputComponent._creator = null;
                        memoryInputComponent.submitType = Consts.ADD_MEMORY;

                    } else {
                        // Create
                        memoryInputComponent.memory = new Memory(memoryInputComponent.myForm.value.title,
                            memoryInputComponent._creator,
                            null,
                            null,
                            memoryInputComponent.myForm.value.description,
                            memoryInputComponent.myForm.value.photos,
                            null,
                            null,
                            null,
                            memoryInputComponent.myForm.value.tags,
                            null,
                            memoryInputComponent.myForm.value.people,
                            this.ngbDateParserFormatter.formatForDB(this.myForm.value.mediaDate));
                        memoryInputComponent.memoryService.addMemory(memoryInputComponent.memory)
                            .subscribe(
                            data => {
                                memoryInputComponent.router.navigate(['memories']).then((ok) => {
                                    if (ok) {
                                        memoryInputComponent.memoryService.showSuccessToast.emit("Memory created.");
                                    };
                                });
                            },
                            error => console.error("MemoryComponent memoryService.newMemory error", error)
                            );
                        memoryInputComponent.memory = null;
                        memoryInputComponent._creator = null;
                        memoryInputComponent.submitType = Consts.ADD_MEMORY;

                    };
                    memoryInputComponent.myForm.reset();
                };
            });

        memoryInputComponent.dialogService.showDialog("Warning", "Do you really wish to " + memoryInputComponent.submitType + "?", "Yes", "No", retDialogSub);

    }

    clear() {
        this.submitType = Consts.ADD_MEMORY;
        this.memory = null;
        this._creator = null;
        this.personService.selectedPeople = [];
        this.tagService.selectedTags = [];
        this.myForm.reset();

    }

    private getId() {
        let _id = null;
        if (this.memory && this.memory._id) {
            _id = this.memory._id;
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
        return this.memoryService.titleExists(control.value, this.getId());
    }

    private extractIdsAsArray(arr: any[]): String[] {
        let retArr: String[] = [];
        for (let element of arr) {
            retArr.push(element.id);
        };
        return retArr;
    }

    ngOnInit() {
        let memoryInputComponent = this;

        memoryInputComponent.tagService.getTags().subscribe(
            (tags: Tag[]) => {
                memoryInputComponent.tagService.multiSelectTagOptions = [];
                for (let tag of tags) {
                    memoryInputComponent.tagService.multiSelectTagOptions.push({ id: tag.id, name: tag.tag });
                };
                console.log(memoryInputComponent.tagService.multiSelectTagOptions);
            }
        );

        memoryInputComponent.personService.getPeople().subscribe(
            (people: Person[]) => {
                memoryInputComponent.personService.multiSelectPersonOptions = [];
                for (let person of people) {
                    memoryInputComponent.personService.multiSelectPersonOptions.push({ id: person.id, name: person.person });
                };
                console.log(memoryInputComponent.personService.multiSelectPersonOptions);
            }
        );

        memoryInputComponent.commentSub = memoryInputComponent.commentsService.commentSub
            .subscribe(
            (comment: Comment) => {
                if (comment.entity === Consts.MEMORY) {
                    memoryInputComponent.memoryService.addComment(memoryInputComponent.memory, comment.comment, comment.entityIndex, comment.callback);
                };
            });


        memoryInputComponent.commentAddedSub = memoryInputComponent.commentsService.commentAddedSub
            .subscribe(
            (comment: CommentDisplay) => {
                memoryInputComponent.memory.comments.push(comment);
            });

        memoryInputComponent._creator = memoryInputComponent.userService.getLoggedInUser()._creatorRef;
        memoryInputComponent.myForm = new FormGroup({
            title: new FormControl(null, Validators.required,
                memoryInputComponent.forbiddenTitles),
            description: new FormControl(null, null),
            tags: new FormControl(null, null),
            photos: new FormControl(null, null),
            mediaDate: new FormControl(null, null),
            people: new FormControl(null, null)
        });
        
        if (memoryInputComponent.route.snapshot.url.length === 2 && memoryInputComponent.route.snapshot.url[0].path === 'memory' && memoryInputComponent.route.snapshot.url[1].path === 'add') {
            memoryInputComponent.submitType = Consts.ADD_MEMORY;
            memoryInputComponent.clear();

        } else {
            memoryInputComponent.paramsSubscription = memoryInputComponent.route.params.subscribe(
                (queryParams: Params) => {
                    memoryInputComponent.index = queryParams['index'];
                    memoryInputComponent.memory = memoryInputComponent.memoryService.findMemoryByIndex(memoryInputComponent.index);
                    memoryInputComponent.modelMediaDate = this.getMediaDate();
                    memoryInputComponent.submitType = Consts.UPDATE_MEMORY;
                    memoryInputComponent.tagService.selectedTags = memoryInputComponent.extractIdsAsArray(memoryInputComponent.memory.tagsToDisplay);
                    memoryInputComponent.personService.selectedPeople = memoryInputComponent.extractIdsAsArray(memoryInputComponent.memory.peopleToDisplay);
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
        this.destroy(this.commentAddedSub);
    }

    isFormValid() {
        let retVal = false;
        if (this.myForm.valid && this.myForm.dirty && this.memory) {
            retVal = true
        }
        return retVal;
    }


    isAddMemory() {
        return this.submitType === Consts.ADD_MEMORY;
    }


    onTagsChange() {
        //console.log(this.optionsModel);
    }

    onPeopleChange() {
        //console.log(this.optionsModel);
    }

}