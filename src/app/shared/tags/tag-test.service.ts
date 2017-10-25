import { Tag } from "./tag.model";
export class TagTestService {

    private static tags: Tag[] = [];
    static getTags() {
        if (TagTestService.tags.length == 0) {
            TagTestService.initialize();
        };
        return TagTestService.tags;
    }

    private static initialize() {
        for (var n = 1; n <= 10; n++) {
            let tagName: string = "tag " + n ;
            let _id: string = "_id" + n;
            let _creator: string = "_creator" + n;

            const tag = new Tag(
                tagName,
                _id,
                _creator);

            TagTestService.tags.push(tag);
        }
    }
}
