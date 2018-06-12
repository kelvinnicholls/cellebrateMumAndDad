import { Http, Response, Headers } from "@angular/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Subject } from 'rxjs/Subject';
import { Router } from "@angular/router";
import * as moment from 'moment';
import 'rxjs/Rx';
import { Observable } from "rxjs";
import { Consts } from "../shared/consts";
import { Memory } from "./memory.model";
import { Photo } from "../photos/photo.model";
import { AppService } from "../app.service";
import { UserService } from "../users/user.service";
import { PhotoService } from "../photos/photo.service";
import { ErrorService } from "../shared/errors/error.service";
import { SearchService } from "../shared/search/search.service";
import { SearchRetEnum } from "../shared/search/search-ret.enum";
import { SearchRet } from "../shared/search/search-ret.model";
import { Search } from "../shared/search/search.model";
import { SearchTypeEnum } from "../shared/search/search-type.enum";
import { CommentDisplay } from "../shared/comments/comment.model";
import { Tag } from "../shared/tags/tag.model";
import { Person } from "../shared/people/person.model";
import { TagService } from "../shared/tags/tag.service";
import { PersonService } from "../shared/people/person.service";
import { CommentsService } from "../shared/comments/comments.service";
import { Utils, LoglevelEnum, SortDataType } from "../shared/utils/utils";
import { User } from "../users/user.model";
import { AuthUserService } from "../auth/auth-user.service";
import { OrderByOption, OrderByDataTypeEnum } from "../shared/search/order-by-option.model";


@Injectable()
export class MemoryService {

    public maxSize: number = 6;
    public bigTotalItems: number = 0;
    public numPages: number = 0;
    public eventItemsPerPage: number = 6;
    private retrievedMemories = false;

    public memories: Memory[] = [];
    public eventPage: number = 1;
    public bigCurrentPage: number = 1;
    private allMemories: Memory[] = [];
    constructor(private http: Http
        , private errorService: ErrorService
        , private appService: AppService
        , private userService: UserService
        , private photoService: PhotoService
        , private commentsService: CommentsService
        , private searchService: SearchService
        , private tagService: TagService
        , private personService: PersonService
        , private authUserService: AuthUserService
    ) {
       
    }


    initialize(): Promise<any> {
        if (this.authUserService.isLoggedIn()) {
            return this.getMemories().toPromise();
        } else
        {
            return Promise.resolve();;
        }
    }

    memoriesChanged = new Subject<Memory[]>();
    memoryDeleted = new Subject<Memory>();

    public searchRet: SearchRet;


    public getMode(memory: Memory) {
        if (this.isAllowed('U', memory)) {
            return Consts.EDIT;
        } else {
            return Consts.VIEW;
        };
    }


    findMemoryByIndex(index: any): Memory {
        return this.memories[index];
    }

    findMemoryById(id: any): Memory {
        return this.allMemories.find((memory) => {
            return memory._id == id;
        });
    }

    private socket;

    addComment(memory: Memory, comment, callback) {
        let memoryService = this;
        memory.comment = comment;

        memoryService.updateMemory(memory).subscribe(
            result => {
                Utils.log(LoglevelEnum.Info,this,result);
                memory.comment = null;
                let commentDate = moment().format(Consts.DATE_TIME_DISPLAY_FORMAT);
                let userName = memoryService.userService.getLoggedInUser().name;
                let profilePicLocation = "";

                if (memoryService.userService.getLoggedInUser().profilePicInfo && memoryService.userService.getLoggedInUser().profilePicInfo.location) {
                    profilePicLocation = memoryService.userService.getLoggedInUser().profilePicInfo.location;
                };

                let commentDisplay = new CommentDisplay(comment, commentDate, userName, profilePicLocation,memory);

                memoryService.commentsService.commentAddedSub.emit(commentDisplay);

                callback();
            }
        );
    }

    createMemory(memory): Memory {
        let memoryService = this;
        let comments: CommentDisplay[] = [];
        //let commentIds: String[] = [];



        if (memory.comments && memory.comments.length > 0) {
            memory.comments.forEach((comment) => {
                let userName = "";
                let profilePicLocation = "";
                let formattedDate = "";
                if (comment.userName) {
                    userName = comment.userName;
                    formattedDate = comment.commentDate;
                    if (comment.profilePicLocation) {
                        if (comment.profilePicLocation.substring(0, 6) !== "images") {
                            profilePicLocation = comment.profilePicLocation.substring(14);
                        } else {
                            profilePicLocation = comment.profilePicLocation;
                        };

                    };

                } else if (comment.user && comment.user.name) {
                    userName = comment.user.name;
                    formattedDate = moment(comment.commentDate).format(Consts.DATE_TIME_DISPLAY_FORMAT);
                    if (comment.user._profileMediaId && comment.user._profileMediaId.location) {
                        if (comment.user._profileMediaId.location.substring(0, 6) !== "images") {
                            profilePicLocation = comment.user._profileMediaId.location.substring(14);
                        } else {
                            profilePicLocation = comment.user._profileMediaId.location;
                        };
                    };
                } else {
                    let user = memoryService.userService.getLoggedInUser();
                    userName = user.name;
                    if (user.profilePicInfo && user.profilePicInfo.location) {
                        profilePicLocation = user.profilePicInfo.location;
                    };
                };

                let newCommentDisplay = new CommentDisplay(comment.comment, formattedDate, userName, profilePicLocation);
                comments.push(newCommentDisplay);
            });
        };

        let tags: Tag[] = [];
        let tagIds: String[] = [];

        if (memory.tags && memory.tags.length > 0) {
            memory.tags.forEach((tag) => {
                if (typeof tag == "string" || tag instanceof String) {
                    let newTag = memoryService.tagService.findTagById(tag);
                    tags.push(newTag);
                    tagIds.push(tag);
                } else {
                    let newTag = new Tag(tag.tag, tag._id);
                    tags.push(newTag);
                    tagIds.push(tag._id);
                };
            });
        };

        let people: Person[] = [];
        let personIds: String[] = [];


        if (memory.people && memory.people.length > 0) {
            memory.people.forEach((person) => {
                if (typeof person == "string" || person instanceof String) {
                    let newPerson = memoryService.personService.findPersonById(person);
                    people.push(newPerson);
                    personIds.push(person);
                } else {
                    let newPerson = new Person(person.person, person._id);
                    people.push(newPerson);
                    personIds.push(person._id);
                };

            });
        };



        let photos: Photo[] = [];
        let photoIds: String[] = [];


        if (memory.medias && memory.medias.length > 0) {
            memory.medias.forEach((photo) => {
                if (typeof photo == "string" || photo instanceof String) {
                    let newPhoto = memoryService.photoService.findPhotoById(photo);
                    photos.push(newPhoto);
                    photoIds.push(photo);
                } else {
                    let newPhoto: Photo = memoryService.photoService.createNewPhoto(photo);
                    photos.push(newPhoto);
                    photoIds.push(photo._id);
                };
            });
        };


        memory.photos = photoIds;
        memory.photosToDisplay = photos;
        memory.tags = tagIds;
        memory.tagsToDisplay = tags;
        memory.people = personIds;
        memory.peopleToDisplay = people;
        memory.comments = comments.sort(Utils.dynamicSort('commentDate', SortDataType.Moment, Consts.DATE_TIME_DISPLAY_FORMAT));



        return new Memory(
            memory.title,
            memory._creator,
            memory.addedDate,
            memory._id,
            memory.description,
            memory.photosToDisplay,
            memory.photos,
            null,
            memory.comments,
            memory.tagsToDisplay,
            memory.tags,
            memory.peopleToDisplay,
            memory.people,
            memory.memoryDate
        );
    }


    titleExists(title: string, _id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));
            this.http.get(Consts.API_URL_MEMORIES_ROOT_TITLE + '/' + title, { headers: headers }).subscribe(
                (response: any) => {
                    let body = JSON.parse(response._body);
                    if ((body.titleFound && !_id) || (body.titleFound && _id && body._id != _id)) {
                        resolve({ 'titleIsAlreadyUsed': true });
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }

    updateThisMemory(memory): any {
        let memoryService = this;

        const updateMemory = memoryService.createMemory(memory);

        memoryService.memories.forEach((element, index) => {
            if (element._id === updateMemory._id) {
                memoryService.memories[index] = updateMemory;
                memoryService.memoriesChanged.next(memoryService.memories);
            };
        });

        memoryService.allMemories.forEach((element, index) => {
            if (element._id === updateMemory._id) {
                memoryService.allMemories[index] = updateMemory;
                return updateMemory;
            };
        });

        return updateMemory;
    }

    addCallbacks(socket: any) {
        this.socket = socket;
        let memoryService = this;
        memoryService.socket.on('createdMemory', (memory, changedBy) => {
            let createdMemory = memoryService.createMemory(memory);
            memoryService.allMemories.push(createdMemory);
            memoryService.memories.push(createdMemory);
            memoryService.allMemories.sort(Utils.dynamicSort('title'));
            memoryService.memories.sort(Utils.dynamicSort('title'));
            memoryService.memoriesChanged.next(memoryService.memories);
            memoryService.appService.showToast(Consts.INFO, "New memory  : " + memory.title + " added by " + changedBy);
            Utils.log(LoglevelEnum.Info,this, "New memory  : " + memory.title + " added by " + changedBy);
        });

        memoryService.socket.on('updatedMemory', (memory, changedBy) => {
            let updatedMemory = memoryService.updateThisMemory(memory);
            memoryService.appService.showToast(Consts.INFO, "Memory  : " + updatedMemory.title + " updated by " + changedBy);
            Utils.log(LoglevelEnum.Info,this, "Memory  : " + updatedMemory.title + " updated by " + changedBy);
        });


        memoryService.socket.on('deletedMemory', (id, changedBy) => {
            let memoryToBeDeleted = memoryService.findMemoryById(id);
            if (memoryToBeDeleted) {
                memoryService.removeMemory(memoryToBeDeleted);;
                memoryService.appService.showToast(Consts.INFO, "Memory  : " + memoryToBeDeleted.title + " deleted by " + changedBy);
                Utils.log(LoglevelEnum.Info,this, "Memory  : " + memoryToBeDeleted.title + " deleted by " + changedBy);
            };
        });
    }

    addMemory(memory: Memory) {
        const headers: Headers = new Headers();
        headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
        memory._creator = this.userService.getLoggedInUser()._creatorRef;
        const body = JSON.stringify(memory);

        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let memoryService = this;

        return this.http.post(Consts.API_URL_MEMORIES_ROOT, body, { headers: headers })
            .map((response: Response) => {
                const result = response.json();
                const memory = this.createMemory(result);
                memoryService.allMemories.push(memory);
                if (memoryService.searchRet) {
                    memoryService.memories = Search.restrict(memoryService.allMemories, memoryService.searchRet);
                } else {
                    memoryService.memories = memoryService.allMemories.slice(0);
                };
                memoryService.allMemories.sort(Utils.dynamicSort('title'));
                memoryService.memories.sort(Utils.dynamicSort('title'));
                memoryService.memoriesChanged.next(memoryService.memories);
                this.socket.emit('memoryCreated', memory, function (err) {
                    if (err) {
                        Utils.log(LoglevelEnum.Info,this,"memoryCreated err: ", err);
                    } else {
                        Utils.log(LoglevelEnum.Info,this,"memoryCreated No Error");
                    }
                });
                return memory;
            })
            .catch((error: Response) => {
                memoryService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
            });
    }

    getMemories(refresh: Boolean = false) {
        let memoryService = this;
        if ((!memoryService.retrievedMemories || refresh) && memoryService.authUserService.isLoggedIn()) {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));

            return this.http.get(Consts.API_URL_MEMORIES_ROOT, { headers: headers })
                .map((response: Response) => {
                    const memories = response.json().memories;
                    let transformedMemories: Memory[] = [];
                    for (let memory of memories) {
                        let comments: CommentDisplay[] = [];
                        let photos: Photo[] = [];
                        let photoIds: String[] = [];
                        let tags: Tag[] = [];
                        let tagIds: String[] = [];
                        let people: Person[] = [];
                        let personIds: String[] = [];
                        if (memory.comments && memory.comments.length > 0) {
                            memory.comments.forEach((comment) => {
                                let userName = "";
                                let profilePicLocation = "";
                                if (comment.user) {
                                    if (comment.user.name) {
                                        userName = comment.user.name;
                                    };
                                    if (comment.user._profileMediaId && comment.user._profileMediaId.location) {
                                        profilePicLocation = comment.user._profileMediaId.location;
                                        if (profilePicLocation.startsWith('server')) {
                                            profilePicLocation = profilePicLocation.substring(14);
                                        };
                                    };
                                };
                                let commentDisplay = new CommentDisplay(comment.comment, moment(comment.commentDate).format(Consts.DATE_TIME_DISPLAY_FORMAT), userName, profilePicLocation);
                                comments.push(commentDisplay);
                            });
                        };

                        if (memory.tags && memory.tags.length > 0) {
                            memory.tags.forEach((tag) => {
                                let newTag = new Tag(tag.tag, tag._id);
                                tags.push(newTag);
                                tagIds.push(tag._id);
                            });
                        };

                        if (memory.people && memory.people.length > 0) {
                            memory.people.forEach((person) => {
                                let newPerson = new Person(person.person, person._id);
                                people.push(newPerson);
                                personIds.push(person._id);
                            });
                        };

                        if (memory.medias && memory.medias.length > 0) {
                            memory.medias.forEach((photo) => {
                                let newPhoto: Photo = memoryService.photoService.createNewPhoto(photo);
                                photos.push(newPhoto);
                                photoIds.push(photo._id);
                            });
                        };

                        let addedDate = null;
                        if (memory.addedDate) {
                            addedDate = moment(memory.addedDate).format(Consts.DATE_DB_FORMAT);
                        };


                        let memoryDate = null;
                        if (memory.memoryDate) {
                            memoryDate = moment(memory.memoryDate).format(Consts.DATE_DB_FORMAT);
                        };

                        let newMemory = new Memory(
                            memory.title,
                            memory._creator,
                            addedDate,
                            memory._id,
                            memory.description,
                            photos,
                            photoIds,
                            null,
                            comments,
                            tags,
                            tagIds,
                            people,
                            personIds,
                            memoryDate
                        );
                        transformedMemories.push(newMemory);
                    };
                    transformedMemories.sort(Utils.dynamicSort('title'));
                    memoryService.allMemories = transformedMemories;
                    if (memoryService.searchRet) {
                        memoryService.memories = Search.restrict(memoryService.allMemories, memoryService.searchRet);
                    } else {
                        memoryService.memories = memoryService.allMemories.slice(0);
                    };
                    memoryService.bigTotalItems = memoryService.memories.length;
                    memoryService.retrievedMemories = true;
                    return memoryService.memories;
                })
                .catch((error: Response) => {
                    memoryService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                    return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
                });
        };
    }

    public isAllowed(changeType, memory: Memory): boolean {
        let retVal: boolean = true;
        if (changeType == "U" && !memory.comment || changeType == "D") {
            retVal = Utils.checkIsAdminOrOwner(memory._creator, this.userService.getLoggedInUser(), this.authUserService);
        };
        Utils.log(LoglevelEnum.Info,this,"isAllowed retVal", retVal);
        return retVal;
    }

    updateMemory(memory: Memory) {
        let memoryService = this;
        if (memoryService.isAllowed('U', memory)) {

            const headers: Headers = new Headers();
            headers.append(Consts.CONTENT_TYPE, Consts.APP_JSON);
            const body = JSON.stringify(memory);
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));


            return this.http.patch(Consts.API_URL_MEMORIES_ROOT + '/' + memory._id, body, { headers: headers })
                .map((response: any) => {
                    let body = JSON.parse(response._body);
                    memoryService.updateThisMemory(body.memory);
                    memoryService.socket.emit('memoryUpdated', body.memory, function (err) {
                        if (err) {
                            Utils.log(LoglevelEnum.Info,this,"memoryUpdated err: ", err);
                        } else {
                            Utils.log(LoglevelEnum.Info,this,"memoryUpdated No Error");
                        }
                    });
                    return response.json();
                })
                .catch((error: Response) => {
                    memoryService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                    return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
                });
        } else {
            memoryService.errorService.handleError({ title: "There was a problem updating this memory", error: "User must either own the memory or be an admin user!" });
        }
    }


    private removeMemory(memory: Memory) {
        let memoryService = this;
        let allMemoriesIndex = memoryService.allMemories.findIndex((foundMemory) => foundMemory._id === memory._id);
        if (allMemoriesIndex >= 0) {
            memoryService.allMemories.splice(allMemoriesIndex, 1);
        };
        let memoriesIndex = memoryService.memories.findIndex((foundMemory) => foundMemory._id === memory._id);
        if (memoriesIndex >= 0) {
            memoryService.memories.splice(memoriesIndex, 1);
        };
        memoryService.memoriesChanged.next(memoryService.memories);
        memoryService.memoryDeleted.next(memory);
    }

    deleteMemory(memory: Memory) {
        let memoryService = this;
        if (memoryService.isAllowed('D', memory)) {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));
            return memoryService.http.delete(Consts.API_URL_MEMORIES_ROOT + '/' + memory._id, { headers: headers })
                .map((response: Response) => {
                    memoryService.removeMemory(memory);
                    memoryService.socket.emit('memoryDeleted', memory, function (err) {
                        if (err) {
                            Utils.log(LoglevelEnum.Info,this,"memoryDeleted err: ", err);
                        } else {
                            Utils.log(LoglevelEnum.Info,this,"memoryDeleted No Error");
                        }
                    });
                    memoryService.appService.showToast(Consts.INFO, "Memory deleted.");

                    //memoryService.memoriesChanged.next(memoryService.allMemories);
                    return response.json();
                })
                .catch((error: Response) => {
                    memoryService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                    return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
                });
        } else {
            memoryService.errorService.handleError({ title: "There was a problem deleting this memory", error: "User must either own the memory or be an admin user!" });
        }
    }

    clearSearch() {
        this.memories = this.allMemories;
        this.searchRet = null;
        //this.eventPage = 1;
        //this.bigCurrentPage = 1;
        this.memoriesChanged.next(this.memories);
    }

    showSearchCriteria() {
        let retVal: String = "";
        if (this.searchRet) {
            retVal = this.searchRet.getSearchCriteria(this.tagService, this.personService);
        };
        return retVal;
    }

    search() {
        let retSearchSub = new EventEmitter<SearchRet>();

        retSearchSub.subscribe(
            (searchRet: SearchRet) => {

                let buttonPressed = searchRet.searchRetEnum;
                if (buttonPressed === SearchRetEnum.ButtonOne) {
                    this.memories = Search.restrict(this.allMemories, searchRet);
                    this.searchRet = searchRet;
                    this.eventPage = 1;
                    this.memoriesChanged.next(this.memories);
                    this.appService.showToast(Consts.SUCCESS, "Memory list updated.");
                } else {
                    this.appService.showToast(Consts.WARNING, "Search cancelled.");
                }
            });
        let searchFields: String[] = [];
        searchFields.push('title');
        searchFields.push('description');
        searchFields.push('tags');
        searchFields.push('people');
        searchFields.push('photos');
        searchFields.push('from_date');
        searchFields.push('to_date');


        let orderByFields: OrderByOption[] = [];
        orderByFields.push(new OrderByOption('title','Title',OrderByDataTypeEnum.String,true));
        orderByFields.push(new OrderByOption('description','Description'));
        orderByFields.push(new OrderByOption('addedDate','Date Added',OrderByDataTypeEnum.Date));
        orderByFields.push(new OrderByOption('memoryDate','Date of Memory',OrderByDataTypeEnum.Date));


        this.searchService.showSearch("Search Memories", "Enter criteria to restrict list of memories", "Find", "Cancel", retSearchSub, SearchTypeEnum.Memories, searchFields,orderByFields);
    }
}