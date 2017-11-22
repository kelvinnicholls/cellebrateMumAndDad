
import { Consts } from "../shared/consts";
export class AuthUserService {
    private static Consts: Consts;



    isLoggedIn(): boolean {
        return localStorage.getItem('token') !== null;
    }


    isAdminUser(): boolean {
        const loggedInUser = JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER));
        let ret = false;
        if (loggedInUser) {
            let adminUser = loggedInUser.adminUser;
            if ((typeof adminUser === 'string' && adminUser.toLowerCase() === 'yes') || (typeof adminUser === 'boolean' && adminUser)) {
                ret = true;
            };
        };

        return ret;
    }

    isGuestUser(): boolean {
        const loggedInUser = JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER));
        let ret = false;
        if (loggedInUser) {
            let guestUser = loggedInUser.guestUser;
            if ((typeof guestUser === 'string' && guestUser.toLowerCase() === 'yes') || (typeof guestUser === 'boolean' && guestUser)) {
                ret = true;
            };
        };

        return ret;
    }

    getLoggedInUserName() {
        const loggedInUser = JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER));
        let name = "Not Logged In";
        if (loggedInUser) { 
            name = loggedInUser.name;
        };
        return name;
    }

    getLoggedInUserProfilePicLocation() {
        let location = Consts.DEFAULT_PROFILE_PIC_FILE;
        let loggedInUser = JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER));

        if (loggedInUser) {
            if (loggedInUser.profilePicInfo && loggedInUser.profilePicInfo.location) {
                location = loggedInUser.profilePicInfo.location;
            } else if (loggedInUser._profileMediaId && loggedInUser._profileMediaId.location) {
                location = loggedInUser._profileMediaId.location.substring(14);
            }
        }

        return location;
    }

    getLoggedInCreatorRef() {
        const loggedInUser = JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER));
        let _creatorRef = "";
        if (loggedInUser) {
            _creatorRef = loggedInUser._creatorRef;
        }
        return _creatorRef;
    }
}