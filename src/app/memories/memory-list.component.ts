import { Component, OnInit, OnDestroy, ViewContainerRef, EventEmitter } from "@angular/core";
import { NgxGalleryImage } from 'ngx-gallery';
import { Subscription } from 'rxjs/Subscription';
import { Memory } from "./memory.model";
import { MemoryService } from "./memory.service";
import { ToastService } from "../shared/toast/toast.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { Consts } from "../shared/consts";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Dialog } from "../shared/dialog/dialog.model";
import { CommentsService } from "../shared/comments/comments.service";
import { SlideShowService } from "../shared/slideshow/slideshow.service";
import { Utils, LoglevelEnum } from "../shared/utils/utils";

@Component({
    selector: 'app-memory-list',
    templateUrl: './memory-list.component.html',
    styleUrls: ['./memory-list.component.css']
})
export class MemoryListComponent implements OnInit, OnDestroy {

    routeId = "MemoryListComponent";

    showComments(memory: Memory) {
        this.commentsService.showComments("Comments for photo: '" + memory.title + "'", memory.comments);
    }

    checkCanDelete(memory: Memory): boolean {
        return this.memoryService.isAllowed('D', memory);
    }

    onDelete(memory: Memory) {

        let retDialogSub = new EventEmitter<DialogRetEnum>();

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    this.memoryService.deleteMemory(memory)
                        .subscribe(
                        result => Utils.log(LoglevelEnum.Info, this, result)
                        );
                }
            });

        this.dialogService.showDialog("Warning", "Do you really wish to delete this memory?", "Yes", "No", retDialogSub);
    }

    memories: Memory[] = [];


    pagedMemories: Memory[] = [];

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

    private setMemoriesIndex() {
        let memoryListComponent = this;
        memoryListComponent.memories.forEach(function (memory: Memory, index) {
            memoryListComponent.memories[index].index = index;
        });
    }

    private updatePagedMemories(itemsPerPage, page) {
        let startIndex = (itemsPerPage * (page - 1));
        let endIndex = startIndex + itemsPerPage - 1;
        Utils.log(LoglevelEnum.Info, this, 'startIndex : ', startIndex);
        Utils.log(LoglevelEnum.Info, this, 'endIndex : ', endIndex);
        this.setMemoriesIndex();
        this.pagedMemories = this.memories.slice(startIndex, endIndex + 1);
        Utils.log(LoglevelEnum.Info, this, 'pagedMemories size: ' + this.pagedMemories.length);
    }

    public pageChanged(event: any): void {
        this.memoryService.eventItemsPerPage = event.itemsPerPage;
        this.memoryService.eventPage = event.page;
        Utils.log(LoglevelEnum.Info, this, 'Page changed to: ' + this.memoryService.eventPage);
        Utils.log(LoglevelEnum.Info, this, 'Number items per page: ' + this.memoryService.eventItemsPerPage);
        this.updatePagedMemories(this.memoryService.eventItemsPerPage, this.memoryService.eventPage);
    }

    constructor(private slideShowService: SlideShowService, private dialogService: DialogService, private commentsService: CommentsService, private memoryService: MemoryService, private toastService: ToastService, private vcr: ViewContainerRef) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    onSearch() {
        this.memoryService.search();
    }

    onSlideShow(memory: Memory) {
        let galleryImages: NgxGalleryImage[] = [];


        memory.mediasToDisplay.forEach((photo) => {
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
        this.slideShowService.showSlideShow('Memory : ' + memory.title, galleryImages);
    }

    onClearSearch() {
        this.memoryService.clearSearch();
        this.updatePagedMemories(this.memoryService.eventItemsPerPage, this.memoryService.eventPage);
    }

    private removeMemory(memory: Memory) {
        let memoryListComponent = this;
        let foundMemoryIndex = memoryListComponent.pagedMemories.findIndex((foundMemory) => foundMemory._id === memory._id);
        if (foundMemoryIndex >= 0) {
            memoryListComponent.pagedMemories.splice(foundMemoryIndex, 1);
        };
    }


    getNumOfPhotos(memory : Memory): String {
        let retVal : String = "";
        if (memory.medias && memory.medias.length > 0 ) {
            retVal = "(" + memory.medias.length + ")";
        };
        return retVal;
    };

    toastDisplayed = false;

    ngOnInit() {
        let memoryListComponent = this;
        this.toastDisplayed = false;
        memoryListComponent.memoryService.showSuccessToast.subscribe((msg) => {
            if (!memoryListComponent.toastDisplayed) {
                memoryListComponent.toastService.showSuccess(msg);
            };
            memoryListComponent.toastDisplayed = true;
        });

        //('MemoryListComponent ngOnInit.getMemories() before');
        Utils.log(LoglevelEnum.Info,this,'ngOnInit. newMemoryList before');
        memoryListComponent.newMemoryList(memoryListComponent.memoryService.memories);
        // memoryListComponent.memoryService.getMemories()
        //     .subscribe(
        //     (memories: Memory[]) => {
        //         Utils.log(LoglevelEnum.Info,this,'MemoryListComponent ngOnInit.getMemories() after');
        //         memoryListComponent.newMemoryList(memories)
        //     }
        //     );
        memoryListComponent.subscription = memoryListComponent.memoryService.memoriesChanged.subscribe(
            (memories: Memory[]) => {
                Utils.log(LoglevelEnum.Info, this, 'memoriesChanged size: ' + memories.length);
                memoryListComponent.newMemoryList(memories);
            });
        memoryListComponent.subscription = memoryListComponent.memoryService.memoryDeleted.subscribe(
            (memory: Memory) =>
                memoryListComponent.removeMemory(memory));
    }

    newMemoryList(memories: Memory[]) {
        Utils.log(LoglevelEnum.Info, this, 'newMemoryList size: ' + memories.length);
        this.memories = memories;
        this.memoryService.bigTotalItems = this.memories.length;
        this.memoryService.bigCurrentPage = 1;
        this.memoryService.eventPage = 1;
        this.updatePagedMemories(this.memoryService.eventItemsPerPage, this.memoryService.eventPage);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getNoMemoriesText(): string {
        let retVal = "No Memories To Display!";
        if (this.memoryService.searchRet) {
            retVal = "Search returned no results!";
        };
        return retVal;
    }

}