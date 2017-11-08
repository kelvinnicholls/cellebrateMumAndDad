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

@Component({
    selector: 'app-memory-list',
    templateUrl: './memory-list.component.html',
    styleUrls: ['./memory-list.component.css']
})
export class MemoryListComponent implements OnInit, OnDestroy {


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
                        result => console.log(result)
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
        console.log('startIndex : ', startIndex);
        console.log('endIndex : ', endIndex);
        this.setMemoriesIndex();
        this.pagedMemories = this.memories.slice(startIndex, endIndex + 1);
    }

    public pageChanged(event: any): void {
        this.memoryService.eventItemsPerPage = event.itemsPerPage;
        this.memoryService.eventPage = event.page;
        console.log('Page changed to: ' + this.memoryService.eventPage);
        console.log('Number items per page: ' + this.memoryService.eventItemsPerPage);
        this.updatePagedMemories(this.memoryService.eventItemsPerPage, this.memoryService.eventPage);
    }

    constructor(private slideShowService: SlideShowService,private dialogService: DialogService, private commentsService: CommentsService, private memoryService: MemoryService, private toastService: ToastService, private vcr: ViewContainerRef) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    onSearch() {
        this.memoryService.search();
    }

    onSlideShow(memory : Memory) {
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
        this.slideShowService.showSlideShow('Memories', galleryImages);
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


    ngOnInit() {
        let memoryListComponent = this;
        memoryListComponent.memoryService.showSuccessToast.subscribe((msg) => {
            memoryListComponent.toastService.showSuccess(msg);
        });
        memoryListComponent.memoryService.getMemories()
            .subscribe(
            (memories: Memory[]) => {
                memoryListComponent.newMemoryList(memories)
            }
            );
        memoryListComponent.subscription = memoryListComponent.memoryService.memoriesChanged.subscribe(
            (memories: Memory[]) =>
                memoryListComponent.newMemoryList(memories));
        memoryListComponent.subscription = memoryListComponent.memoryService.memoryDeleted.subscribe(
            (memory: Memory) =>
                memoryListComponent.removeMemory(memory));
    }

    newMemoryList(memories: Memory[]) {

        this.memories = memories;
        this.memoryService.bigTotalItems = this.memories.length;
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