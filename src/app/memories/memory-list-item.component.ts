import { Component, Input, ViewContainerRef, EventEmitter, ViewChild } from "@angular/core";
import { Memory } from './memory.model';
import { MemoryService } from "./memory.service";
import { ToastService } from "../shared/toast/toast.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Utils, LoglevelEnum } from "../shared/utils/utils";
import { ContextMenuComponent } from 'ngx-contextmenu';
import { CommentsService } from "../shared/comments/comments.service";
import { Consts } from "../shared/consts";
@Component({
    selector: 'app-memory-list-item',
    templateUrl: './memory-list-item.component.html',
    styleUrls: ['./memory-list-item.component.css'],

})
export class MemoryListItemComponent {
    @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;

    @Input() memory: Memory;

    @Input() index: number;

    constructor(private commentsService: CommentsService, private dialogService: DialogService, private memoryService: MemoryService, private toastService: ToastService, private vcr: ViewContainerRef) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    checkCanDelete(memory: Memory): boolean {
        return this.memoryService.isAllowed('D', memory);
    }

    public getSource() {
        let retSource = Consts.DEFAULT_PHOTO_PIC_FILE;
        if (this.memory.mediasToDisplay && this.memory.mediasToDisplay.length > 0) {
            retSource = this.memory.mediasToDisplay[0].getSource();
        }
        return retSource;
    };

    deleteMemory() {

        let retDialogSub = new EventEmitter<DialogRetEnum>();
        let memoryListItemComponent = this;
        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    this.memoryService.deleteMemory(memoryListItemComponent.memory)
                        .subscribe(
                        result => Utils.log(LoglevelEnum.Info, memoryListItemComponent, result)
                        );
                }
            });

        this.dialogService.showDialog("Warning", "Do you really wish to delete this memory?", "Yes", "No", retDialogSub);
    }

    addComment(memory: Memory) {
        this.commentsService.showAddComment(this.memory);
    };

    showComments() {
        this.commentsService.showComments("Comments for memory: '" + this.memory.title + "'", this.memory.comments);
    }
}