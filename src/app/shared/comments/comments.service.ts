import { EventEmitter, Injectable } from "@angular/core";
import { Consts } from "../consts";
import { CommentDisplay, Comments, Comment } from "./comment.model";

export class CommentsService {

  public commentSub = new EventEmitter<Comment>();
  public commentAddedSub = new EventEmitter<CommentDisplay>();
  

  showCommentsSub = new EventEmitter<Comments>();

  showComments(title: string, commentsDisplay: CommentDisplay[]) {

    const comments = new Comments(title, commentsDisplay);
    this.showCommentsSub.emit(comments);
  }

}