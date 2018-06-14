import { Component, OnInit, OnDestroy, ViewContainerRef, EventEmitter } from "@angular/core";
import { Subscription } from 'rxjs/Subscription';
import { Photo } from "./photo.model";
import { PhotoService } from "./photo.service";
import { ToastService } from "../shared/toast/toast.service";
import { NgxGalleryOptions } from 'ngx-gallery';
import { Consts } from "../shared/consts";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Dialog } from "../shared/dialog/dialog.model";
import { CommentsService } from "../shared/comments/comments.service";
import { SlideShowService } from "../shared/slideshow/slideshow.service";
import { NgxGalleryImage } from 'ngx-gallery';
import { Utils, LoglevelEnum } from "../shared/utils/utils";
import { Comment, CommentDisplay } from "../shared/comments/comment.model";
import { listStateTrigger } from '../shared/animations';

@Component({
    selector: 'app-photo-list',
    templateUrl: './photo-list.component.html',
    styleUrls: ['./photo-list.component.css'],
    animations: [
        listStateTrigger
    ]
})
export class PhotoListComponent implements OnInit, OnDestroy {

    

    private commentSub: EventEmitter<Comment>;

    routeId = "PhotoListComponent";

    defaultPhotoFile = Consts.DEFAULT_PHOTO_PIC_FILE;


    static numCols: number = 3;
    static numRows: number = 2;

    photos: Photo[] = [];

    pagedPhotos: Photo[] = [];

    subscription: Subscription;


    //private itemsPerPage: number = 5;

    private hideSearchCriteriaText: String = "Hide Search Criteria";
    public showSearchCriteriaText: String = "Show Search Criteria";
    public toggleShowHideSearchCriteriaText = this.showSearchCriteriaText;

    toggleShowHideSearchCriteria() {
        if (this.toggleShowHideSearchCriteriaText === this.hideSearchCriteriaText) {
            this.toggleShowHideSearchCriteriaText = this.showSearchCriteriaText;
        } else {
            this.toggleShowHideSearchCriteriaText = this.hideSearchCriteriaText;
        };
    };

    private setPhotosIndex() {
        let photoListComponent = this;
        photoListComponent.photos.forEach(function (photo: Photo, index) {
            photoListComponent.photos[index].index = index;
        });
    };

    private updatePagedPhotos(itemsPerPage, page) {
        let startIndex = (itemsPerPage * (page - 1));
        let endIndex = startIndex + itemsPerPage - 1;
        Utils.log(LoglevelEnum.Info, this, 'startIndex : ', startIndex);
        Utils.log(LoglevelEnum.Info, this, 'endIndex : ', endIndex);
        this.setPhotosIndex();
        this.pagedPhotos = this.photos.slice(startIndex, endIndex + 1);
        Utils.log(LoglevelEnum.Info, this, 'pagedPhotos size: ' + this.pagedPhotos.length);
    };

    public pageChanged(event: any): void {
        this.photoService.eventItemsPerPage = event.itemsPerPage;
        this.photoService.eventPage = event.page;
        Utils.log(LoglevelEnum.Info, this, 'Page changed to: ' + this.photoService.eventPage);
        Utils.log(LoglevelEnum.Info, this, 'Number items per page: ' + this.photoService.eventItemsPerPage);
        this.updatePagedPhotos(this.photoService.eventItemsPerPage, this.photoService.eventPage);
    };

    constructor(private slideShowService: SlideShowService, private commentsService: CommentsService, public photoService: PhotoService, private toastService: ToastService, private vcr: ViewContainerRef) {
        toastService.toast.setRootViewContainerRef(vcr);
        // https://stackoverflow.com/questions/36354325/angular-2-ngfor-using-numbers-instead-collections
    }


    onSlideShow() {
        let galleryImages: NgxGalleryImage[] = [];

        this.photos.forEach((photo) => {
            if (photo && photo.photoInfo && photo.photoInfo.location) {
                let location = photo.photoInfo.location.replace(/\\/g, "/");
                let photoObj = {
                    small: location,
                    medium: location,
                    big: location,
                    description: photo.title
                };
                galleryImages.push(photoObj);
            };
        });
        this.slideShowService.showSlideShow('Photos', galleryImages);
    };

    onSearch() {
        this.photoService.search();
    };

    onClearSearch() {
        this.photoService.clearSearch();
        this.updatePagedPhotos(this.photoService.eventItemsPerPage, this.photoService.eventPage);
    };

    private removePhoto(photo: Photo) {
        let photoListComponent = this;
        let foundPhotoIndex = photoListComponent.pagedPhotos.findIndex((foundPhoto) => foundPhoto._id === photo._id);
        if (foundPhotoIndex >= 0) {
            photoListComponent.pagedPhotos.splice(foundPhotoIndex, 1);
        };
    };


    ngOnInit() {
        let photoListComponent = this;
        Utils.log(LoglevelEnum.Info, this, 'ngOnInit. newPhotoList before');
        photoListComponent.newPhotoList(photoListComponent.photoService.photos);
        photoListComponent.subscription = photoListComponent.photoService.photosChanged.subscribe(
            (photos: Photo[]) => {
                Utils.log(LoglevelEnum.Info, this, 'photosChanged size: ' + photos.length);
                photoListComponent.newPhotoList(photos);
            });
        photoListComponent.subscription = photoListComponent.photoService.photoDeleted.subscribe(
            (photo: Photo) =>
                photoListComponent.removePhoto(photo));

        photoListComponent.commentSub = photoListComponent.commentsService.commentSub
            .subscribe(
            (comment: Comment) => {
                if (comment.entity.entityType === Consts.PHOTO) {
                    photoListComponent.photoService.addComment(comment.entity as Photo, comment.comment, comment.callback);
                };
            });
    }

    newPhotoList(photos: Photo[]) {
        Utils.log(LoglevelEnum.Info, this, 'newPhotoList size: ' + photos.length);
        this.photos = photos;
        this.photoService.bigTotalItems = this.photos.length;
        this.photoService.eventPage = 1;
        this.photoService.bigCurrentPage = 1;
        this.updatePagedPhotos(this.photoService.eventItemsPerPage, this.photoService.eventPage);
    }

    destroy(sub: any) {
        if (sub) {
            sub.unsubscribe();
            sub = null;
        }
    }

    ngOnDestroy() {
        this.destroy(this.subscription);
        this.destroy(this.commentSub);
    }

    getNoPhotosText(): string {
        let retVal = "No Photos To Display!";
        if (this.photoService.searchRet) {
            retVal = "Search returned no results!";
        };
        return retVal;
    }

}