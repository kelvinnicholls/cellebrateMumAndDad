import { Consts } from "../shared/consts";

export class User {

    constructor(public email: string,
        public password: string,
        public name: string,
        public adminUser: string | boolean,
        public relationship: string,
        public dob?: string,
        public twitterId?: string,
        public facebookId?: string,
        public _creatorRef?: string,
        public profilePicData?: File,
        public profilePicLocation?: string
    ) {
        if (profilePicLocation) {
            this.profilePicLocation = profilePicLocation.replace(Consts.PUBLIC_REG_EXPR, "");
        };
    }

};
