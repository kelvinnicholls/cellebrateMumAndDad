import { EventEmitter } from "@angular/core";
import { Consts } from "../consts";
import { CommentDisplay, Comments, Comment } from "./comment.model";
import { Photo } from "../../photos/photo.model";
import { Memory } from "../../memories/memory.model";

export class CommentsService {

  public commentSub = new EventEmitter<Comment>();
  public commentAddedSub = new EventEmitter<CommentDisplay>();


  showCommentsSub = new EventEmitter<Comments>();
  showAddCommentsSub = new EventEmitter<Photo | Memory>();

  showComments(title: string, commentsDisplay: CommentDisplay[]) {

    const comments = new Comments(title, commentsDisplay);
    this.showCommentsSub.emit(comments);
  }

  showAddComment(entity: Photo | Memory) {
    this.showAddCommentsSub.emit(entity);
  }

}