import * as moment from 'moment';
import { User } from "../../users/user.model";
import { AuthUserService } from "../../auth/auth-user.service";
export class Utils {
    public static dynamicSort(property, dataType: SortDataType = SortDataType.String, format?: string) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            var result = 0;
            if (dataType === SortDataType.String) {
                result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            } else if (dataType === SortDataType.Moment) {
                result = (moment(a[property], format) < moment(b[property], format)) ? -1 : (moment(a[property], format) > moment(b[property], format)) ? 1 : 0;
            };

            return result * sortOrder;
        }
    }

    public static initCap(passedString: String) {
        return passedString.charAt(0).toUpperCase() + passedString.slice(1).toLowerCase();
    }

    public static checkIsAdminOrOwner(creator: string, loggedInUser: User,authUserService: AuthUserService): boolean {
        console.log("checkIsAdminOrOwner", creator, loggedInUser.adminUser, loggedInUser._creatorRef);
        let retVal = false;

        if (!authUserService.isGuestUser() && ((loggedInUser.adminUser.toString().toLowerCase() == 'yes' || (loggedInUser._creatorRef === creator)) {
            retVal = true;
        };
        console.log("checkIsAdminOrOwner retVal", retVal);
        return retVal;

    }
}

export enum SortDataType {
    String
    , Moment
}