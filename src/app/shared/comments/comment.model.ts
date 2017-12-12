
import { Photo } from "../../photos/photo.model";
import { Memory } from "../../memories/memory.model";

export class Comment {
    constructor(public entity : Photo | Memory,public comment: string, public callback: any) { }
}

export class CommentDisplay {
    constructor(public comment: string, public commentDate: string, public userName: string, public profilePicLocation: string, public entity : Photo | Memory = null) { }
}

export class Comments {
    constructor(public title: string, public commentsDisplay: CommentDisplay[]) { }
}