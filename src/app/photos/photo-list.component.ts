import { Component, OnInit, OnDestroy, ViewContainerRef, EventEmitter} from "@angular/core";
import { Subscription } from 'rxjs/Subscription';
import { Photo } from "./photo.model";
import { PhotoService } from "./photo.service";
import { ToastService } from "../shared/toast/toast.service";
import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery';
import { DialogService } from "../shared/dialog/dialog.service";
import { Consts } from "../shared/consts";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Dialog } from "../shared/dialog/dialog.model";
import { CommentsService } from "../shared/comments/comments.service";



@Component({
    selector: 'app-photo-list',
    templateUrl: './photo-list.component.html',
    styleUrls: ['./photo-list.component.css']
})
export class PhotoListComponent implements OnInit, OnDestroy {

    defaultPhotoFile = Consts.DEFAULT_PHOTO_PIC_FILE;;
 
    showComments(photo : Photo) {
        this.commentsService.showComments("Comments for photo: '" + photo.title + "'",photo.comments);
    }

    checkCanDelete(photo : Photo): boolean {
        return this.photoService.isAllowed('D', photo);
    }

    onDelete(photo : Photo) {

        let retDialogSub = new EventEmitter<DialogRetEnum>();

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    this.photoService.deletePhoto(photo)
                        .subscribe(
                        result => console.log(result)
                        );
                }
            });

        this.dialogService.showDialog("Warning", "Do you really wish to delete this photo?", "Yes", "No", retDialogSub);
    }



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
        }
    }

    private setPhotosIndex() {
        let photoListComponent = this;
        photoListComponent.photos.forEach(function (photo: Photo, index) {
            photoListComponent.photos[index].index = index;
        });
    }

    private updatePagedPhotos(itemsPerPage, page) {
        let startIndex = (itemsPerPage * (page - 1));
        let endIndex = startIndex + itemsPerPage - 1;
        console.log('startIndex : ', startIndex);
        console.log('endIndex : ', endIndex);
        this.setPhotosIndex();
        this.pagedPhotos = this.photos.slice(startIndex, endIndex + 1);
    }

    public pageChanged(event: any): void {
        this.photoService.eventItemsPerPage = event.itemsPerPage;
        this.photoService.eventPage = event.page;
        console.log('Page changed to: ' + this.photoService.eventPage);
        console.log('Number items per page: ' + this.photoService.eventItemsPerPage);
        this.updatePagedPhotos(this.photoService.eventItemsPerPage, this.photoService.eventPage);
    }

    constructor(private dialogService: DialogService, private commentsService: CommentsService, private photoService: PhotoService, private toastService: ToastService, private vcr: ViewContainerRef) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    onSearch() {
        this.photoService.search();
    }

    onClearSearch() {
        this.photoService.clearSearch();
        this.updatePagedPhotos(this.photoService.eventItemsPerPage, this.photoService.eventPage);
    }

    private removePhoto(photo: Photo) {
        let photoListComponent = this;
        let foundPhotoIndex = photoListComponent.pagedPhotos.findIndex((foundPhoto) => foundPhoto._id === photo._id);
        if (foundPhotoIndex >= 0) {
            photoListComponent.pagedPhotos.splice(foundPhotoIndex, 1);
        };
    }


    ngOnInit() {
        let photoListComponent = this;

        photoListComponent.photoService.showSuccessToast.subscribe((msg) => {
            photoListComponent.toastService.showSuccess(msg);
        });
        photoListComponent.photoService.getPhotos()
            .subscribe(
            (photos: Photo[]) => {
                photoListComponent.newPhotoList(photos)
            }
            );
        photoListComponent.subscription = photoListComponent.photoService.photosChanged.subscribe(
            (photos: Photo[]) =>
                photoListComponent.newPhotoList(photos));
        photoListComponent.subscription = photoListComponent.photoService.photoDeleted.subscribe(
            (photo: Photo) =>
                photoListComponent.removePhoto(photo));
    }

    newPhotoList(photos: Photo[]) {

        this.photos = photos;
        this.photoService.bigTotalItems = this.photos.length;
        this.updatePagedPhotos(this.photoService.eventItemsPerPage, this.photoService.eventPage);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getNoPhotosText(): string {
        let retVal = "No Photos To Display!";
        if (this.photoService.searchRet) {
            retVal = "Search returned no results!";
        };
        return retVal;
    }

}