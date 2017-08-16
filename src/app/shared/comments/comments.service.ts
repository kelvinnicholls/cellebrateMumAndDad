import { EventEmitter, Injectable } from "@angular/core";
import { Consts } from "../consts";
import { Comment } from "./comment.model";

export class CommentsService {

  public commentSub = new EventEmitter<Comment>();

}