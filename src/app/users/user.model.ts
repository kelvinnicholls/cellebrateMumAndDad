export class User {

    public index;

    constructor(public email: string,
        public password: string,
        public name: string,
        public adminUser: string | boolean,
        public emailUpdates: string | boolean,
        public relationship: string,
        public dob?: string,
        public twitterId?: string,
        public facebookId?: string,
        public _creatorRef?: string,
        public profilePicData?: File,
        public profilePicLocation?: string
    ) {
        if (profilePicLocation) {
            this.profilePicLocation = profilePicLocation.substring(14);
        };
    }

};
