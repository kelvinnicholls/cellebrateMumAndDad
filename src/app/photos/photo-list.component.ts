import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs/Subscription';
import { Photo } from "./photo.model";
import { PhotoService } from "./photo.service";

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
    public bigCurrentPage: number = 1;
    public numPages: number = 0;

    private itemsPerPage: number = 5;

    private eventItemsPerPage: number = 5;
    private eventPage: number = 1;

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
        this.eventPage = event.page;
        console.log('Page changed to: ' + this.eventPage);
        console.log('Number items per page: ' + this.eventItemsPerPage);
        this.updatePagedPhotos(this.eventItemsPerPage, this.eventPage);
    }

    constructor(private photoService: PhotoService) { }

    onSearch() {
        this.photoService.search();
    }

    onClearSearch() {
        this.photoService.clearSearch();
    }

    ngOnInit() {
        this.photoService.getPhotos()
            .subscribe(
            (photos: Photo[]) => {
                this.newPhotoList(photos)
            }
            );
        this.subscription = this.photoService.photosChanged.subscribe((photos: Photo[]) => this.newPhotoList(photos));
    }

    newPhotoList(photos: Photo[]) {
        this.photos = photos;
        this.bigTotalItems = this.photos.length;
        this.updatePagedPhotos(this.eventItemsPerPage, this.eventPage);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}