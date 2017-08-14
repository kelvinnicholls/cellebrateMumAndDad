import { Http, Response, Headers } from "@angular/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Subject } from 'rxjs/Subject';
import { Router } from "@angular/router";
import * as moment from 'moment';
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



@Injectable()
export class PhotoService {
    private photos: Photo[] = [];
    private allPhotos: Photo[] = [];
    constructor(private http: Http, private errorService: ErrorService, private appService: AppService, private userService: UserService, private searchService: SearchService, private router: Router) { }

    photosChanged = new Subject<Photo[]>();


    public searchRet: SearchRet;

    findPhotoByIndex(index: any): Photo {
        return this.photos[index];
    }

    findPhotoById(id: any): Photo {
        return this.photos.find((photo) => {
            return photo._id === id;
        });
    }

    private socket;


    createPhoto(photo, photoInfo): Photo {
        return new Photo(
            photo.title,
            photo._creator,
            photo.addedDate,
            photo._id,
            photo.description,
            null,
            photo.photoInfo);
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
        const updatePhoto = this.createPhoto(photo, photo.photoInfo);
        if (!updatePhoto.photoInfo) {
            updatePhoto.photoInfo = {};
        };
        if (photo._mediaId && !photo._mediaId.isUrl) {
            updatePhoto.photoInfo.location = photo._mediaId.location.substring(14);
        } else if (photo._mediaId && photo._mediaId.isUrl) {
            updatePhoto.photoInfo.location = photo._mediaId.location;
        };

        this.photos.forEach((element, index) => {
            if (element._id === updatePhoto._id) {
                this.photos[index] = updatePhoto;
                this.photosChanged.next(this.photos);
                return updatePhoto;
            };
        });
        return updatePhoto;
    }

    addCallbacks(socket: any) {
        this.socket = socket;

        this.socket.on('createdPhoto', (photo, changedBy) => {
            this.photos.push(this.createPhoto(photo, photo.photoInfo));
            this.photosChanged.next(this.photos);
            this.appService.showToast(Consts.INFO, "New photo  : " + photo.name + " added by " + changedBy);
            console.log(Consts.INFO, "New photo  : " + photo.name + " added by " + changedBy);
        });

        this.socket.on('updatedPhoto', (photo, changedBy) => {
            let updatedPhoto = this.updateThisPhoto(photo);
            this.appService.showToast(Consts.INFO, "Photo  : " + updatedPhoto.name + " updated by " + changedBy);
            console.log(Consts.INFO, "Photo  : " + updatedPhoto.name + " updated by " + changedBy);
        });


        this.socket.on('deletedPhoto', (id, changedBy) => {
            let photoToBeDeleted = this.findPhotoById(id);
            if (photoToBeDeleted) {
                this.photos.splice(this.photos.indexOf(photoToBeDeleted), 1);
                this.photosChanged.next(this.photos);
                this.appService.showToast(Consts.INFO, "Photo  : " + photoToBeDeleted.title + " deleted by " + changedBy);
                console.log(Consts.INFO, "Photo  : " + photoToBeDeleted.title + " deleted by " + changedBy);
            };
        });
    }

    addPhoto(photo: Photo) {
        var fd = new FormData();
        const headers: Headers = new Headers();
        if (photo.photoFile) {
            fd.append('file', photo.photoFile, photo.photoFile.name);
        };

        photo.photoFile = null;
        photo._creator = this.userService.getLoggedInUser()._creatorRef;
        const photoJsonString = JSON.stringify(photo);
        fd.append('photo', photoJsonString);
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let photoService = this;
        return this.http.post(Consts.API_URL_MEDIAS_ROOT, fd, { headers: headers })
            .map((response: Response) => {
                const result = response.json();
                let photoInfo: any = {};
                photoInfo.location = result.location;
                photoInfo.isUrl = result.isUrl;
                const photo = this.createPhoto(result, photoInfo);
                photoService.photos.push(photo);

                this.socket.emit('photoCreated', photo, function (err) {
                    if (err) {
                        console.log("photoCreated err: ", err);
                    } else {
                        console.log("photoCreated No Error");
                    }
                });

                photoService.photosChanged.next(this.photos);
                return photo;
            })
            .catch((error: Response) => {
                photoService.errorService.handleError(error.json() || error.toString());
                return Observable.throw(error.json() || error.toString());
            });
    }

    getPhotos() {
        const headers: Headers = new Headers();
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let photoService = this;
        return this.http.get(Consts.API_URL_MEDIAS_ROOT, { headers: headers })
            .map((response: Response) => {
                const photos = response.json();
                let transformedPhotos: Photo[] = [];
                for (let photo of photos) {
                    let photoInfo: any = {};
                    if (photo._mediaId && photo._mediaId.location) {
                        photoInfo.location = photo._mediaId.location;
                        photoInfo.isUrl = photo._mediaId.isUrl;
                    };

                    let newPhoto = new Photo(
                        photo.title,
                        photo._creator,
                        moment(photo.addedDate).format(Consts.DATE_DB_FORMAT),
                        photo._id,
                        photo.description,
                        null,
                        photo.photoInfo);
                    transformedPhotos.push(newPhoto);
                }
                this.allPhotos = transformedPhotos;
                this.photos = this.allPhotos.slice(0);
                return transformedPhotos;
            })
            .catch((error: Response) => {
                photoService.errorService.handleError(error.json() || error.toString());
                return Observable.throw(error.json() || error.toString());
            });
    }

    updatePhoto(photo: Photo) {
        var fd = new FormData();
        const headers: Headers = new Headers();
        if (photo.photoFile) {
            fd.append('file', photo.photoFile, photo.photoFile.name);
        };

        photo.photoFile = null;
        const photoJsonString = JSON.stringify(photo);
        fd.append('photo', photoJsonString);

        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let photoService = this;
        return this.http.patch(Consts.API_URL_MEDIAS_ROOT + '/' + photo._id, fd, { headers: headers })
            .map((response: any) => {
                let body = JSON.parse(response._body);
                let updatedPhoto = this.updateThisPhoto(body);

                this.socket.emit('photoUpdated', updatedPhoto, function (err) {
                    if (err) {
                        console.log("photoUpdated err: ", err);
                    } else {
                        console.log("photoUpdated No Error");
                    }
                });

                return response.json();
            })
            .catch((error: Response) => {
                photoService.errorService.handleError(error.json() || error.toString());
                return Observable.throw(error.json() || error.toString());
            });
    }

    deletePhoto(photo: Photo) {

        const headers: Headers = new Headers();
        headers.set(Consts.X_AUTH, localStorage.getItem('token'));
        let photoService = this;
        return this.http.delete(Consts.API_URL_MEDIAS_ROOT + '/' + photo._id, { headers: headers })
            .map((response: Response) => {
                photoService.photos.splice(photo.index, 1);

                this.socket.emit('photoDeleted', photo, function (err) {
                    if (err) {
                        console.log("photoDeleted err: ", err);
                    } else {
                        console.log("photoDeleted No Error");
                    }
                });

                photoService.photosChanged.next(photoService.photos);
                return response.json();
            })
            .catch((error: Response) => {
                photoService.errorService.handleError(error.json() || error.toString());
                return Observable.throw(error.json() || error.toString());
            });
    }

    clearSearch() {
        this.photos = this.allPhotos;
        this.searchRet = null;
        this.photosChanged.next(this.photos);
    }

    showSearchCriteria() {
        let retVal: String = "";
        if (this.searchRet) {
            retVal = this.searchRet.getSearchCriteria();
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
                    this.photosChanged.next(this.photos);
                    this.appService.showToast(Consts.SUCCESS, "Photo list updated.");
                } else {
                    this.appService.showToast(Consts.WARNING, "Search cancelled.");
                }
            });
        this.searchService.showSearch("Search Photos", "Enter criteria to restrict list of photos", "Find", "Cancel", retSearchSub, SearchTypeEnum.Photos);
    }
}