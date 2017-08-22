import { Component } from '@angular/core';
import { CommentDisplay,Comments } from "../comment.model";


import { EventEmitter } from "@angular/core";
import { CommentsService } from "../comments.service";

@Component({
  selector: 'app-comments-list',
  templateUrl: './comments-list.component.html',
  styleUrls: ['./comments-list.component.css']
})
export class CommentListComponent  {

  commentsDisplay : CommentDisplay[] = [];
  title : string = "";

  display = 'none';
  private showCommentsSub: EventEmitter<CommentDisplay[]>;


  constructor(private commentsService: CommentsService) { }

  onClose() {
      this.display = 'none';
  }

  
  ngOnInit() {
      this.showCommentsSub = this.commentsService.showCommentsSub
          .subscribe(
          (comments: Comments) => {
              this.commentsDisplay = comments.commentsDisplay;
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
