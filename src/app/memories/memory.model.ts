import { CommentDisplay } from "../shared/comments/comment.model";
import { Tag } from "../shared/tags/tag.model";
import { Person } from "../shared/people/person.model";
import { Photo } from "../photos/photo.model";
export class Memory {

    public index;

    constructor(public title: string,
        public _creator,
        public addedDate: string,
        public _id: string,
        public description?: string,
        public photos?: Photo[],
        public comment?: string,
        public comments?: CommentDisplay[],
        public tagsToDisplay?: Tag[],
        public tags?: String[],
        public peopleToDisplay?: Person[],
        public people?: String[],
        public mediaDate?: string,
    ) {
    }


};
