import * as moment from 'moment';
import { User } from "../../users/user.model";
import { AuthUserService } from "../../auth/auth-user.service";
import { Consts } from "../consts";


export enum SortDataType {
    String
    , Moment
}

export enum LoglevelEnum {
    Error
    , Warn
    , Info
}

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

    public static checkIsAdminOrOwner(creator: string, loggedInUser: User, authUserService: AuthUserService): boolean {
        Utils.log(LoglevelEnum.Info, this, "checkIsAdminOrOwner", creator, loggedInUser.adminUser, loggedInUser._creatorRef);
        let retVal = false;

        if (!authUserService.isGuestUser() && ((loggedInUser.adminUser.toString().toLowerCase() == 'yes' || (loggedInUser._creatorRef === creator)))) {
            retVal = true;
        };
        Utils.log(LoglevelEnum.Info, this, "checkIsAdminOrOwner retVal", retVal);
        return retVal;

    }

    private static LOG_LEVEL = LoglevelEnum.Error;

    public static setLogLevel(loglevelEnum: LoglevelEnum) {
        Utils.LOG_LEVEL = loglevelEnum;
    };


    public static getLogLevel() {
        return Utils.LOG_LEVEL;
    };

    public static log(...args: any[]) {
        let passedArguments = args.slice();
        if (passedArguments && passedArguments.length > 0) {
            let logLevel = passedArguments[0];
            passedArguments[0] = moment().format(Consts.DATE_TIME_DISPLAY_FORMAT);
            if (logLevel <= Utils.LOG_LEVEL) {
                let that = passedArguments[1];
                let className: string = that.constructor.toString().match(/\w+/g)[1];
                passedArguments[1] = className;
                console.log.apply(this, passedArguments);
            };
        };
    };


    public static isObjectId (id : any):boolean {
        let retVal:boolean = false;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            retVal = true; 
        };
        return retVal;
    };


};

