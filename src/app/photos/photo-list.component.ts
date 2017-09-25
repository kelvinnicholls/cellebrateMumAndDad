import { Component, OnInit, OnDestroy, ViewContainerRef } from "@angular/core";
import { Subscription } from 'rxjs/Subscription';
import { Photo } from "./photo.model";
import { PhotoService } from "./photo.service";
import { ToastService } from "../shared/toast/toast.service";

@Component({
    selector: 'app-photo-list',
    templateUrl: './photo-list.component.html',
    styleUrls: ['./photo-list.component.css']
})
export class PhotoListComponent implements OnInit, OnDestroy {
    photos: Photo[] = [];

    pagedPhotos: Photo[] = [];

    subscription: Subscription;


    public maxSize: number = 5;
    public bigTotalItems: number = this.photos.length;

    public numPages: number = 0;

    private itemsPerPage: number = 5;

    private eventItemsPerPage: number = 5;


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
        this.eventItemsPerPage = event.itemsPerPage;
        this.photoService.eventPage = event.page;
        console.log('Page changed to: ' + this.photoService.eventPage);
        console.log('Number items per page: ' + this.eventItemsPerPage);
        this.updatePagedPhotos(this.eventItemsPerPage, this.photoService.eventPage);
    }

    constructor(private photoService: PhotoService, private toastService: ToastService, private vcr: ViewContainerRef) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    onSearch() {
        this.photoService.search();
    }

    onClearSearch() {
        this.photoService.clearSearch();
        this.updatePagedPhotos(this.eventItemsPerPage, this.photoService.eventPage);
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
        photoListComponent.subscription = photoListComponent.photoService.photosChanged.subscribe((photos: Photo[]) => photoListComponent.newPhotoList(photos));
    }

    newPhotoList(photos: Photo[]) {

        this.photos = photos;
        this.bigTotalItems = this.photos.length;
        this.updatePagedPhotos(this.eventItemsPerPage, this.photoService.eventPage);
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