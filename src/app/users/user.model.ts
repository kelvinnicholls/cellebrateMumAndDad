import { Consts } from "../shared/consts";
export class User {

    public index;

    public readonly entityType = Consts.USER;

    constructor(public email: string,
        public password: string,
        public name: string,
        public adminUser: string | boolean,
        public guestUser: string | boolean,
        public emailUpdates: string | boolean,
        public relationship: string,
        public dob?: string,
        public twitterId?: string,
        public facebookId?: string,
        public _creatorRef?: string,
        public profilePicFile?: File,
        public profilePicInfo?: any // {location:string,mimeType:string,isUrl:boolean}
    ) {
        if (profilePicInfo && profilePicInfo.location && !profilePicInfo.isUrl && profilePicInfo.location.startsWith('server')) {
            this.profilePicInfo.location = profilePicInfo.location.substring(14);
        };

    }

};
