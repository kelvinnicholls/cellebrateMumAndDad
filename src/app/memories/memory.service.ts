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
import { Utils, SortDataType } from "../shared/utils/utils";
import { User } from "../users/user.model";

@Injectable()
export class MemoryService {

    public maxSize: number = 5;
    public bigTotalItems: number = 0;
    public numPages: number = 0;
    public eventItemsPerPage: number = 5;

    public memories: Memory[] = [];
    public eventPage: number = 1;
    public bigCurrentPage: number = 1;
    private allMemories: Memory[] = [];
    constructor(private http: Http
        , private errorService: ErrorService
        , private appService: AppService
        , private userService: UserService
        , private photoService : PhotoService
        , private commentsService: CommentsService
        , private searchService: SearchService
        , private tagService: TagService
        , private personService: PersonService
        , private router: Router) {
    }

    memoriesChanged = new Subject<Memory[]>();
    memoryDeleted = new Subject<Memory>();

    showSuccessToast = new EventEmitter<string>();


    public searchRet: SearchRet;

    findMemoryByIndex(index: any): Memory {
        return this.memories[index];
    }

    findMemoryById(id: any): Memory {
        return this.allMemories.find((memory) => {
            return memory._id === id;
        });
    }

    private socket;

    addComment(memory: Memory, comment, entityIndex, callback) {
        let memoryService = this;
        memory.comment = comment;

        memoryService.updateMemory(memory).subscribe(
            result => {
                console.log(result);
                memory.comment = null;
                let commentDate = moment().format(Consts.DATE_TIME_DISPLAY_FORMAT);
                let userName = memoryService.userService.getLoggedInUser().name;
                let profilePicLocation = "";

                if (memoryService.userService.getLoggedInUser().profilePicInfo && memoryService.userService.getLoggedInUser().profilePicInfo.location) {
                    profilePicLocation = memoryService.userService.getLoggedInUser().profilePicInfo.location;
                };

                let commentDisplay = new CommentDisplay(comment, commentDate, userName, profilePicLocation);

                memoryService.commentsService.commentAddedSub.emit(commentDisplay);

                // memoryService.allMemories[entityIndex].comments.push(commentDisplay);
                // memoryService.memories.forEach((element, index) => {
                //     if (element.index === entityIndex) {
                //         memoryService.memories[index].comments.push(commentDisplay);
                //         memoryService.memoriesChanged.next(memoryService.memories);
                //     };
                // });
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
                } else if (comment.user) {
                    userName = comment.user.name;
                    formattedDate = moment(comment.commentDate).format(Consts.DATE_TIME_DISPLAY_FORMAT);
                    if (comment.user._profileMediaId && comment.user._profileMediaId.location) {
                        profilePicLocation = comment.user._profileMediaId.location.substring(14);
                    } else {
                        profilePicLocation = comment.user._profileMediaId.location;
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
                if (tag._id) {
                    let newTag = new Tag(tag.tag, tag._id);
                    tags.push(newTag);
                    tagIds.push(tag._id);
                } else {
                    let newTag = memoryService.tagService.findTagById(tag);
                    tags.push(newTag);
                    tagIds.push(tag);
                };
            });
        };

        let people: Person[] = [];
        let personIds: String[] = [];


        if (memory.people && memory.people.length > 0) {
            memory.people.forEach((person) => {
                if (person._id) {
                    let newPerson = new Person(person.person, person._id);
                    people.push(newPerson);
                    personIds.push(person._id);
                } else {
                    let newPerson = memoryService.personService.findPersonById(person);
                    people.push(newPerson);
                    personIds.push(person);
                };
            });
        };



        let photos: Photo[] = [];
        let photoIds: String[] = [];


        if (memory.medias && memory.medias.length > 0) {
            memory.medias.forEach((photo) => {
                let newPhoto: Photo = memoryService.photoService.createNewPhoto(photo);
                photos.push(newPhoto);
                photoIds.push(photo._id);
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
            console.log(Consts.INFO, "New memory  : " + memory.title + " added by " + changedBy);
        });

        memoryService.socket.on('updatedMemory', (memory, changedBy) => {
            let updatedMemory = memoryService.updateThisMemory(memory);
            memoryService.appService.showToast(Consts.INFO, "Memory  : " + updatedMemory.title + " updated by " + changedBy);
            console.log(Consts.INFO, "Memory  : " + updatedMemory.title + " updated by " + changedBy);
        });


        memoryService.socket.on('deletedMemory', (id, changedBy) => {
            let memoryToBeDeleted = memoryService.findMemoryById(id);
            if (memoryToBeDeleted) {
                memoryService.removeMemory(memoryToBeDeleted);
                //this.allMemories.splice(this.allMemories.indexOf(memoryToBeDeleted), 1);
                //this.memoriesChanged.next(this.allMemories);
                memoryService.appService.showToast(Consts.INFO, "Memory  : " + memoryToBeDeleted.title + " deleted by " + changedBy);
                console.log(Consts.INFO, "Memory  : " + memoryToBeDeleted.title + " deleted by " + changedBy);
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
                memoryService.memories.push(memory);
                memoryService.allMemories.sort(Utils.dynamicSort('title'));
                memoryService.memories.sort(Utils.dynamicSort('title'));
                memoryService.memoriesChanged.next(memoryService.memories);
                this.socket.emit('memoryCreated', memory, function (err) {
                    if (err) {
                        console.log("memoryCreated err: ", err);
                    } else {
                        console.log("memoryCreated No Error");
                    }
                });
                return memory;
            })
            .catch((error: Response) => {
                memoryService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
            });
    }

    getMemories(): Observable<any> {
        let memoryService = this;
        if (memoryService.memories.length > 0) {
            if (memoryService.searchRet) {
                memoryService.memories = Search.restrict(memoryService.allMemories, memoryService.searchRet);
            } else {
                memoryService.memories = memoryService.allMemories.slice(0);
            };
            return Observable.of(memoryService.memories);
        } else {
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

                        let newMemory = new Memory(
                            memory.title,
                            memory._creator,
                            moment(memory.addedDate).format(Consts.DATE_DB_FORMAT),
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
                            moment(memory.memoryDate).format(Consts.DATE_DB_FORMAT)
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
                    return memoryService.memories;
                })
                .catch((error: Response) => {
                    memoryService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                    return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
                });
        };
    }

    private isAllowed(changeType, memory: Memory): boolean {
        let retVal: boolean = true;
        if (changeType == "U" && !memory.comment || changeType == "D") {
            retVal = Utils.checkIsAdminOrOwner(memory._creator, this.userService.getLoggedInUser());
        };
        console.log("isAllowed retVal", retVal);
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
                            console.log("memoryUpdated err: ", err);
                        } else {
                            console.log("memoryUpdated No Error");
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
                            console.log("memoryDeleted err: ", err);
                        } else {
                            console.log("memoryDeleted No Error");
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
        searchFields.push('from_date');
        searchFields.push('to_date');

        this.searchService.showSearch("Search Memories", "Enter criteria to restrict list of memories", "Find", "Cancel", retSearchSub, SearchTypeEnum.Memories, searchFields);
    }
}