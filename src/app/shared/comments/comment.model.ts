
export class Comment {
    constructor(public entity: string, public entityIndex: any, public comment: string, public callback: any) { }
}

export class CommentDisplay {
    constructor(public comment: string, public commentDate: string, public userName: string, public profilePicLocation: string) { }
}

export class Comments {
    constructor(public title: string, public commentsDisplay: CommentDisplay[]) { }
}