import { Component } from "@angular/core";
import { PhotoService } from "./photos/photo.service";
import { AuthService } from "./auth/auth.service";
import { AuthUserService } from "./auth/auth-user.service";
import { Utils,LoglevelEnum } from "./shared/utils/utils";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    constructor(public authService: AuthService,public authUserService: AuthUserService,public photoService: PhotoService) { }

    public loglevelEnum : LoglevelEnum;

    setLogLevel(logLevel : LoglevelEnum) {
        Utils.setLogLevel(logLevel);
    };

    isError() {
        return Utils.getLogLevel() === LoglevelEnum.Error;
    }

    isWarn() {
        return Utils.getLogLevel() === LoglevelEnum.Warn;
    }


    isInfo() {
        return Utils.getLogLevel() === LoglevelEnum.Info;
    }


    zipPhotos() {
        this.photoService.zipPhotos();
    }

}