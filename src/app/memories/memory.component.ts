import { Component, Input, OnInit, EventEmitter, OnDestroy } from "@angular/core";
import { Memory } from "./memory.model";
import { MemoryService } from "./memory.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { Consts } from "../shared/consts";
import { DialogRetEnum } from "../shared/dialog/dialog-ret.enum";
import { Dialog } from "../shared/dialog/dialog.model";
import { CommentsService } from "../shared/comments/comments.service";

@Component({
    selector: 'app-memory',
    templateUrl: './memory.component.html',
    styles: [`
        .author {
            display: inline-block;
            font-style: italic;
            font-size: 12px;
            color : #0275d8;
        }
        .config {
            display: inline-block;
            text-align: right;
            font-size: 12px;
            color : #0275d8;
        }
    `]
})
export class MemoryComponent implements OnInit, OnDestroy {
    @Input() memory: Memory;
    @Input() mode: String;
    //@Input() index: Number;
    defaultMemoryFile = Consts.DEFAULT_PHOTO_PIC_FILE;;
    constructor(private memoryService: MemoryService, private dialogService: DialogService, private commentsService: CommentsService) { }

    checkCanDelete(): boolean {
        return this.memoryService.isAllowed('D', this.memory);
    }

    showComments() {
        this.commentsService.showComments("Comments for memory: '" + this.memory.title + "'", this.memory.comments);
    }


    onDelete() {

        let retDialogSub = new EventEmitter<DialogRetEnum>();

        retDialogSub.subscribe(
            (buttonPressed: DialogRetEnum) => {
                if (buttonPressed === DialogRetEnum.ButtonOne) {
                    this.memoryService.deleteMemory(this.memory)
                        .subscribe(
                        result => console.log(result)
                        );
                }
            });

        this.dialogService.showDialog("Warning", "Do you really wish to delete this memory?", "Yes", "No", retDialogSub);
    }

    ngOnInit() {

    }

    destroy(sub: any) {
        if (sub) {
            sub.unsubscribe();
            sub = null;
        }
    }

    ngOnDestroy() {
    }
}