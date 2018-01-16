import { CommentDisplay } from "../shared/comments/comment.model";
import { Tag } from "../shared/tags/tag.model";
import { Person } from "../shared/people/person.model";
import { Consts } from "../shared/consts";
export class Photo {

    public index;

    defaultProfilePicFile = Consts.DEFAULT_PHOTO_PIC_FILE;

    public readonly entityType = Consts.PHOTO;

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
        public tags?: String[],
        public peopleToDisplay?: Person[],
        public people?: String[],
        public mediaDate?: string,
    ) {
        if (photoInfo && photoInfo.location && !photoInfo.isUrl && photoInfo.location.startsWith('server')) {
            this.photoInfo.location = photoInfo.location.substring(14);
        };

    }

    public getSource(): string {
        let retVal: string = this.defaultProfilePicFile;
        if (this.photoInfo && this.photoInfo.location) {
            retVal = this.photoInfo.location;
        }
        return retVal;
    }


};
