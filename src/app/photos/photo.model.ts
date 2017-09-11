import { CommentDisplay } from "../shared/comments/comment.model";
import { Tag } from "../shared/tags/tag.model";
export class Photo {

    public index;

    constructor(public title: string,
        public _creator,
        public addedDate: string,
        public _id: string,
        public description?: string,
        public photoFile?: File,
        public photoInfo?: any, // {location:string,mimeType:string,isUrl:boolean,originalFileName:string,mediaDate:date}
        public comment?: string,
        public comments?: CommentDisplay[],
        public tagsToDisplay?: Tag[],
        public tags?: string[]
    ) {
        if (photoInfo && photoInfo.location && !photoInfo.isUrl && photoInfo.location.startsWith('server')) {
            this.photoInfo.location = photoInfo.location.substring(14);
        };

    }


};
