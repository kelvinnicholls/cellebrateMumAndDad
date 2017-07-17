
import { Consts } from "../shared/consts";
export class AuthUserService {
    private static Consts: Consts;


    isLoggedIn(): boolean {
        return localStorage.getItem('token') !== null;
    }


    isAdminUser(): boolean {
        return JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER)).adminUser;
    }

    getLoggedInUserName() {
        return JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER)).name;
    }

    getLoggedInUserProfilePicLocation() {
        let location = Consts.DEFAULT_PROFILE_PIC_FILE;
        let loggedInUser = JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER));

        if (loggedInUser) {
            if (loggedInUser.profilePicLocation) {
                location = loggedInUser.profilePicLocation;
            } else if (loggedInUser._profileMediaId && loggedInUser._profileMediaId.location) {
                location = loggedInUser._profileMediaId.location.substring(14);
            }
        }

        return location;
    }

    getLoggedInCreatorRef() {
        return JSON.parse(localStorage.getItem(Consts.LOGGED_IN_USER))._creatorRef;
    }
}