import { Http, Response, Headers } from "@angular/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Subject } from 'rxjs/Subject';
import { Router } from "@angular/router";
import * as moment from 'moment';
import { IMultiSelectTexts, IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import 'rxjs/Rx';
import { Observable } from "rxjs";
import { Consts } from "../shared/consts";
import { Photo } from "./photo.model";
import { AppService } from "../app.service";
import { UserService } from "../users/user.service";
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

@Injectable()
export class PhotoService {


    photo: string = "photo";
    photoplural: string = this.photo + "'s";
    public selectedPhotos: String[] = [];
    private retrievedPhotos = false;

    public findPhotoTitleById(id: any): string {
        let photoTitle = "";
        let photo: Photo = this.findPhotoById(id);
        if (photo) {
            photoTitle = photo.title;
        };
        return photoTitle;
    }

    // Text configuration 
    public multiSelectPhotosTexts: IMultiSelectTexts = {
        checkAll: 'Select all ' + this.photoplural,
        uncheckAll: 'Unselect all ' + this.photoplural,
        checked: this.photo + ' selected',
        checkedPlural: this.photoplural + '  selected',
        searchPlaceholder: 'Find ' + this.photo,
        defaultTitle: this.photoplural,
        allSelected: 'All ' + this.photoplural + ' selected',
    };


    public multiSelectPhotoOptions: IMultiSelectOption[] = [
    ];

    public maxSize: number = 6;
    public bigTotalItems: number = 0;
    public numPages: number = 0;
    public eventItemsPerPage: number = 6;

    public photos: Photo[] = [];
    public eventPage: number = 1;
    public bigCurrentPage: number = 1;
    private allPhotos: Photo[] = [];
    constructor(private http: Http
        , private errorService: ErrorService
        , private appService: AppService
        , private userService: UserService
        , private commentsService: CommentsService
        , private searchService: SearchService
        , private tagService: TagService
        , private personService: PersonService
        , private authUserService: AuthUserService
        , private router: Router) {
        this.initialize();

    }

    async initialize() {
        this.getPhotos();
    }

    photosChanged = new Subject<Photo[]>();
    photoDeleted = new Subject<Photo>();

    showSuccessToast = new EventEmitter<string>();


    public searchRet: SearchRet;

    public getMode(photo: Photo) {
        if (this.isAllowed('U', photo)) {
            return Consts.EDIT;
        } else {
            return Consts.VIEW;
        };
    }

    findPhotoByIndex(index: any): Photo {
        return this.photos[index];
    }

    findPhotoById(id: any): Photo {
        return this.allPhotos.find((photo) => {
            return photo._id === id;
        });
    }

    private socket;

    addComment(photo: Photo, comment, entityIndex, callback) {
        let photoService = this;
        photo.comment = comment;

        photoService.updatePhoto(photo).subscribe(
            result => {
                Utils.log(LoglevelEnum.Info,this,result);
                photo.comment = null;
                let commentDate = moment().format(Consts.DATE_TIME_DISPLAY_FORMAT);
                let userName = photoService.userService.getLoggedInUser().name;
                let profilePicLocation = "";

                if (photoService.userService.getLoggedInUser().profilePicInfo && photoService.userService.getLoggedInUser().profilePicInfo.location) {
                    profilePicLocation = photoService.userService.getLoggedInUser().profilePicInfo.location;
                };

                let commentDisplay = new CommentDisplay(comment, commentDate, userName, profilePicLocation);

                photoService.commentsService.commentAddedSub.emit(commentDisplay);

                // photoService.allPhotos[entityIndex].comments.push(commentDisplay);
                // photoService.photos.forEach((element, index) => {
                //     if (element.index === entityIndex) {
                //         photoService.photos[index].comments.push(commentDisplay);
                //         photoService.photosChanged.next(photoService.photos);
                //     };
                // });
                callback();
            }
        );
    }

    createPhoto(photo, inPhotoInfo): Photo {
        let photoService = this;
        let comments: CommentDisplay[] = [];
        //let commentIds: String[] = [];



        if (photo.comments && photo.comments.length > 0) {
            photo.comments.forEach((comment) => {
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
                } else if (comment.user instanceof User) {
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
                    let user = photoService.userService.getLoggedInUser();
                    userName = user.name;
                    if (user.profilePicInfo && user.profilePicInfo.location) {
                        profilePicLocation = user.profilePicInfo.location;
                    };
                };

                //let formattedDate = moment(comment.commentDate).format(Consts.DATE_TIME_DISPLAY_FORMAT);    

                let newCommentDisplay = new CommentDisplay(comment.comment, formattedDate, userName, profilePicLocation);
                comments.push(newCommentDisplay);
                //commentIds.push(comment._id);
            });
        };

        let tags: Tag[] = [];
        let tagIds: String[] = [];

        if (photo.tags && photo.tags.length > 0) {
            photo.tags.forEach((tag) => {
                if (typeof tag == "string" || tag instanceof String) {
                    let newTag = photoService.tagService.findTagById(tag);
                    tags.push(newTag);
                    tagIds.push(tag);
                } else {
                    let newTag = new Tag(tag.tag, tag._id);
                    tags.push(newTag);
                    tagIds.push(tag._id);
                };
                // let newTag = new Tag(tag.tag, tag._id);
                // tags.push(newTag);
                // tagIds.push(tag._id);
                // if (tag._id) {
                //     let newTag = new Tag(tag.tag, tag._id);
                //     tags.push(newTag);
                //     tagIds.push(tag._id);
                // } else {
                //     let newTag = photoService.tagService.findTagById(tag);
                //     tags.push(newTag);
                //     tagIds.push(tag);
                // };
            });
        };

        let people: Person[] = [];
        let personIds: String[] = [];


        if (photo.people && photo.people.length > 0) {
            photo.people.forEach((person) => {
                if (typeof person == "string" || person instanceof String) {
                    let newPerson = photoService.personService.findPersonById(person);
                    people.push(newPerson);
                    personIds.push(person);
                } else {
                    let newPerson = new Person(person.person, person._id);
                    people.push(newPerson);
                    personIds.push(person._id);
                };

                // let newPerson = new Person(person.person, person._id);
                // people.push(newPerson);
                // personIds.push(person._id);
                // if (person._id) {
                //     let newPerson = new Person(person.person, person._id);
                //     people.push(newPerson);
                //     personIds.push(person._id);
                // } else {
                //     let newPerson = photoService.personService.findPersonById(person);
                //     people.push(newPerson);
                //     personIds.push(person);
                // };
            });
        };

        photo.tags = tagIds;
        photo.tagsToDisplay = tags;
        photo.people = personIds;
        photo.peopleToDisplay = people;
        photo.comments = comments.sort(Utils.dynamicSort('commentDate', SortDataType.Moment, Consts.DATE_TIME_DISPLAY_FORMAT));

        let photoInfo: any = {};

        if (!photo.photoInfo) {
            photoInfo.location = photo.location;
            photoInfo.isUrl = photo.isUrl;
            photoInfo.mimeType = photo.mimeType;
        } else {
            if (inPhotoInfo) {
                photoInfo = photo.inPhotoInfo;
            } else {
                photoInfo = photo.photoInfo;
            };
        };


        return new Photo(
            photo.title,
            photo._creator,
            photo.addedDate,
            photo._id,
            photo.description,
            null,
            photoInfo,
            null,
            photo.comments,
            photo.tagsToDisplay,
            photo.tags,
            photo.peopleToDisplay,
            photo.people,
            photo.mediaDate
        );
    }


    titleExists(title: string, _id: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));
            this.http.get(Consts.API_URL_MEDIAS_ROOT_TITLE + '/' + title, { headers: headers }).subscribe(
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

    updateThisPhoto(photo): any {
        let photoService = this;

        const updatePhoto = photoService.createPhoto(photo, null);
        if (!updatePhoto.photoInfo) {
            updatePhoto.photoInfo = {};
        };


        if (photo._mediaId && !photo._mediaId.isUrl) {
            updatePhoto.photoInfo.location = photo._mediaId.location.substring(14);
        } else if (photo._mediaId && photo._mediaId.isUrl) {
            updatePhoto.photoInfo.location = photo._mediaId.location;
        };

        photoService.photos.forEach((element, index) => {
            if (element._id === updatePhoto._id) {
                photoService.photos[index] = updatePhoto;
                photoService.photosChanged.next(photoService.photos);
            };
        });

        photoService.allPhotos.forEach((element, index) => {
            if (element._id === updatePhoto._id) {
                photoService.allPhotos[index] = updatePhoto;
                return updatePhoto;
            };
        });

        return updatePhoto;
    }

    addCallbacks(socket: any) {
        this.socket = socket;
        let photoService = this;
        photoService.socket.on('createdPhoto', (photo, changedBy) => {
            let createdPhoto = photoService.createPhoto(photo, null);
            photoService.allPhotos.push(createdPhoto);
            photoService.multiSelectPhotoOptions.push({ id: createdPhoto._id, name: createdPhoto.title });
            photoService.photos.push(createdPhoto);
            photoService.allPhotos.sort(Utils.dynamicSort('title'));
            photoService.photos.sort(Utils.dynamicSort('title'));
            photoService.photosChanged.next(photoService.photos);
            photoService.appService.showToast(Consts.INFO, "New photo  : " + photo.title + " added by " + changedBy);
            Utils.log(LoglevelEnum.Info,this, "New photo  : " + photo.title + " added by " + changedBy);
        });

        photoService.socket.on('updatedPhoto', (photo, changedBy) => {
            let updatedPhoto = photoService.updateThisPhoto(photo);
            photoService.appService.showToast(Consts.INFO, "Photo  : " + updatedPhoto.title + " updated by " + changedBy);
            Utils.log(LoglevelEnum.Info,this, "Photo  : " + updatedPhoto.title + " updated by " + changedBy);
        });


        photoService.socket.on('deletedPhoto', (id, changedBy) => {
            let photoToBeDeleted = photoService.findPhotoById(id);
            if (photoToBeDeleted) {
                photoService.removePhoto(photoToBeDeleted);
                //this.allPhotos.splice(this.allPhotos.indexOf(photoToBeDeleted), 1);
                //this.photosChanged.next(this.allPhotos);
                photoService.appService.showToast(Consts.INFO, "Photo  : " + photoToBeDeleted.title + " deleted by " + changedBy);
                Utils.log(LoglevelEnum.Info,this, "Photo  : " + photoToBeDeleted.title + " deleted by " + changedBy);
            };
        });
    }

    addPhoto(photo: Photo) {
        let photoService = this;
        var fd = new FormData();
        const headers: Headers = new Headers();
        if (photo.photoFile) {
            fd.append('file', photo.photoFile);
        };
        photo.photoFile = null;
        photo._creator = this.userService.getLoggedInUser()._creatorRef;
        const photoJsonString = JSON.stringify(photo);
        fd.append('media', photoJsonString);
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));

        return this.http.post(Consts.API_URL_MEDIAS_ROOT, fd, { headers: headers })
            .map((response: Response) => {
                const result = response.json();
                let photoInfo: any = {};
                photoInfo.location = result.location;
                photoInfo.isUrl = result.isUrl;
                const photo = this.createPhoto(result, photoInfo);
                photoService.multiSelectPhotoOptions.push({ id: photo._id, name: photo.title });
                photoService.allPhotos.push(photo);
                photoService.photos.push(photo);
                photoService.allPhotos.sort(Utils.dynamicSort('title'));
                photoService.photos.sort(Utils.dynamicSort('title'));
                photoService.photosChanged.next(photoService.photos);
                this.socket.emit('photoCreated', photo, function (err) {
                    if (err) {
                        Utils.log(LoglevelEnum.Info,this,"photoCreated err: ", err);
                    } else {
                        Utils.log(LoglevelEnum.Info,this,"photoCreated No Error");
                    }
                });
                return photo;
            })
            .catch((error: Response) => {
                photoService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
            });
    }

    public createNewPhoto(photo): Photo {
        let photoInfo: any = {};

        photoInfo.location = photo.location;
        photoInfo.isUrl = photo.isUrl;
        photoInfo.mimeType = photo.mimeType;

        let comments: CommentDisplay[] = [];
        let tags: Tag[] = [];
        let tagIds: String[] = [];
        let people: Person[] = [];
        let personIds: String[] = [];
        if (photo.comments && photo.comments.length > 0) {
            photo.comments.forEach((comment) => {
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

        if (photo.tags && photo.tags.length > 0) {
            photo.tags.forEach((tag) => {
                let newTag = new Tag(tag.tag, tag._id);
                tags.push(newTag);
                tagIds.push(tag._id);
            });
        };

        if (photo.people && photo.people.length > 0) {
            photo.people.forEach((person) => {
                let newPerson = new Person(person.person, person._id);
                people.push(newPerson);
                personIds.push(person._id);
            });
        };

        let addedDate = null;
        if (photo.mediaDate) {
            addedDate = moment(photo.addedDate).format(Consts.DATE_DB_FORMAT);
        };


        let mediaDate = null;
        if (photo.mediaDate) {
            mediaDate = moment(photo.mediaDate).format(Consts.DATE_DB_FORMAT);
        };

        let newPhoto = new Photo(
            photo.title,
            photo._creator,
            addedDate,
            photo._id,
            photo.description,
            null,
            photoInfo,
            null,
            comments,
            tags,
            tagIds,
            people,
            personIds,
            mediaDate
        );
        return newPhoto;
    }

    getPhotos(refresh: Boolean = false) {
        let photoService = this;
        // if ((!photoService.retrievedPhotos || refresh) && photoService.authUserService.isLoggedIn()) {
        //     if (photoService.searchRet) {
        //         photoService.photos = Search.restrict(photoService.allPhotos, photoService.searchRet);
        //     } else {
        //         photoService.photos = photoService.allPhotos.slice(0);
        //     };

        // } else {
        if ((!photoService.retrievedPhotos || refresh) && photoService.authUserService.isLoggedIn()) {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));

            this.http.get(Consts.API_URL_MEDIAS_ROOT, { headers: headers })
                .map((response: Response) => {
                    const photos = response.json().medias;
                    let transformedPhotos: Photo[] = [];
                    photoService.multiSelectPhotoOptions = [];
                    for (let photo of photos) {
                        let newPhoto: Photo = photoService.createNewPhoto(photo);
                        transformedPhotos.push(newPhoto);
                        photoService.multiSelectPhotoOptions.push({ id: photo._id, name: photo.title });
                    };
                    transformedPhotos.sort(Utils.dynamicSort('title'));
                    photoService.allPhotos = transformedPhotos;
                    if (photoService.searchRet) {
                        photoService.photos = Search.restrict(photoService.allPhotos, photoService.searchRet);
                    } else {
                        photoService.photos = photoService.allPhotos.slice(0);
                    };
                    photoService.bigTotalItems = photoService.photos.length;
                    photoService.retrievedPhotos = true;
                })
                .catch((error: Response) => {
                    photoService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                    return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
                }).subscribe();
        };
    }

    public isAllowed(changeType, photo: Photo): boolean {
        let retVal: boolean = true;
        if (changeType == "U" && !photo.comment || changeType == "D") {
            retVal = Utils.checkIsAdminOrOwner(photo._creator, this.userService.getLoggedInUser(), this.authUserService);
        };
        Utils.log(LoglevelEnum.Info,this,"isAllowed retVal", retVal);
        return retVal;
    }

    updatePhoto(photo: Photo) {
        let photoService = this;
        if (photoService.isAllowed('U', photo)) {
            var fd = new FormData();
            const headers: Headers = new Headers();
            if (photo.photoFile) {
                fd.append('file', photo.photoFile);
            };

            photo.photoFile = null;
            const photoJsonString = JSON.stringify(photo);
            fd.append('media', photoJsonString);

            headers.set(Consts.X_AUTH, localStorage.getItem('token'));

            return this.http.patch(Consts.API_URL_MEDIAS_ROOT + '/' + photo._id, fd, { headers: headers })
                .map((response: any) => {
                    let body = JSON.parse(response._body);
                    photoService.updateThisPhoto(body.media);
                    photoService.socket.emit('photoUpdated', body.media, function (err) {
                        if (err) {
                            Utils.log(LoglevelEnum.Info,this,"photoUpdated err: ", err);
                        } else {
                            Utils.log(LoglevelEnum.Info,this,"photoUpdated No Error");
                        }
                    });
                    return response.json();
                })
                .catch((error: Response) => {
                    photoService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                    return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
                });
        } else {
            photoService.errorService.handleError({ title: "There was a problem updating this photo", error: "User must either own the photo or be an admin user!" });
        }
    }


    private removePhoto(photo: Photo) {
        let photoService = this;
        let allPhotosIndex = photoService.allPhotos.findIndex((foundPhoto) => foundPhoto._id === photo._id);
        if (allPhotosIndex >= 0) {
            photoService.allPhotos.splice(allPhotosIndex, 1);
        };
        let photosIndex = photoService.photos.findIndex((foundPhoto) => foundPhoto._id === photo._id);
        if (photosIndex >= 0) {
            photoService.photos.splice(photosIndex, 1);
        };
        photoService.photosChanged.next(photoService.photos);
        photoService.photoDeleted.next(photo);
    }

    deletePhoto(photo: Photo) {
        let photoService = this;
        if (photoService.isAllowed('D', photo)) {
            const headers: Headers = new Headers();
            headers.set(Consts.X_AUTH, localStorage.getItem('token'));
            return photoService.http.delete(Consts.API_URL_MEDIAS_ROOT + '/' + photo._id, { headers: headers })
                .map((response: Response) => {
                    photoService.removePhoto(photo);
                    photoService.socket.emit('photoDeleted', photo, function (err) {
                        if (err) {
                            Utils.log(LoglevelEnum.Info,this,"photoDeleted err: ", err);
                        } else {
                            Utils.log(LoglevelEnum.Info,this,"photoDeleted No Error");
                        }
                    });
                    photoService.appService.showToast(Consts.INFO, "Photo deleted.");

                    //photoService.photosChanged.next(photoService.allPhotos);
                    return response.json();
                })
                .catch((error: Response) => {
                    photoService.errorService.handleError((error.toString && error.toString()) || (error.json && error.json()));
                    return Observable.throw((error.toString && error.toString()) || (error.json && error.json()));
                });
        } else {
            photoService.errorService.handleError({ title: "There was a problem deleting this photo", error: "User must either own the photo or be an admin user!" });
        }
    }

    clearSearch() {
        this.photos = this.allPhotos;
        this.searchRet = null;
        //this.eventPage = 1;
        //this.bigCurrentPage = 1;
        this.photosChanged.next(this.photos);
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
                    this.photos = Search.restrict(this.allPhotos, searchRet);
                    this.searchRet = searchRet;
                    this.eventPage = 1;
                    this.photosChanged.next(this.photos);
                    this.appService.showToast(Consts.SUCCESS, "Photo list updated.");
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

        this.searchService.showSearch("Search Photos", "Enter criteria to restrict list of photos", "Find", "Cancel", retSearchSub, SearchTypeEnum.Photos, searchFields);
    }
}