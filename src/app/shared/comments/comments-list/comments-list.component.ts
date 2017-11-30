import { Component } from '@angular/core';
import { CommentDisplay, Comments } from "../comment.model";


import { EventEmitter } from "@angular/core";
import { CommentsService } from "../comments.service";
import { Utils, LoglevelEnum } from "../../../shared/utils/utils";

@Component({
    selector: 'app-comments-list',
    templateUrl: './comments-list.component.html',
    styleUrls: ['./comments-list.component.css']
})
export class CommentListComponent {

    commentsDisplay: CommentDisplay[] = [];
    title: string = "";

    display = 'none';
    private showCommentsSub: EventEmitter<CommentDisplay[]>;


    pagedCommentsDisplay: CommentDisplay[] = [];
    public maxSize: number;
    public bigTotalItems: number;
    public bigCurrentPage: number;
    public numPages: number;
    private itemsPerPage: number;
    private eventItemsPerPage: number;
    private eventPage: number;

    private updatePagedCommentsDisplay(itemsPerPage, page) {
        let startIndex = (itemsPerPage * (page - 1));
        let endIndex = startIndex + itemsPerPage - 1;
        Utils.log(LoglevelEnum.Info,'startIndex : ', startIndex);
        Utils.log(LoglevelEnum.Info,'endIndex : ', endIndex);
        this.pagedCommentsDisplay = this.commentsDisplay.slice(startIndex, endIndex + 1);
    }

    public pageChanged(event: any): void {
        this.eventItemsPerPage = event.itemsPerPage;
        this.eventPage = event.page;
        Utils.log(LoglevelEnum.Info,'Page changed to: ' + this.eventPage);
        Utils.log(LoglevelEnum.Info,'Number items per page: ' + this.eventItemsPerPage);
        this.updatePagedCommentsDisplay(this.eventItemsPerPage, this.eventPage);
    }


    constructor(private commentsService: CommentsService) { }

    onClose() {
        this.display = 'none';
    }


    ngOnInit() {
        this.showCommentsSub = this.commentsService.showCommentsSub
            .subscribe(
            (comments: Comments) => {
                this.commentsDisplay = comments.commentsDisplay.slice();
                this.commentsDisplay.reverse();
                this.maxSize = 4;
                this.bigTotalItems = this.commentsDisplay.length;
                this.bigCurrentPage = 1;
                this.numPages = 0;
                this.itemsPerPage = 2;
                this.eventItemsPerPage = 2;
                this.eventPage = 1;
                this.updatePagedCommentsDisplay(this.eventItemsPerPage, this.eventPage);
                this.title = comments.title;
                this.display = 'block';
            }
            );
    }

    destroy(sub: any) {
        if (sub) {
            sub.unsubscribe();
            sub = null;
        }
    }

    ngOnDestroy() {
        this.destroy(this.showCommentsSub);
    }

}
