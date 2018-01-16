import { Component, ViewContainerRef } from '@angular/core';
import { ToastService } from "./shared/toast/toast.service";
import { AppService } from "./app.service";
import { Toast } from "./shared/toast/toast.model";
import { AuthUserService } from "./auth/auth-user.service";
import  {routeStateSlideInTrigger} from './shared/route-animations';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [ToastService],
    animations: [
      routeStateSlideInTrigger
    ]
})
export class AppComponent {

    private toastOccurredSub: any;

    getAnimationsData(outlet: RouterOutlet) {
        const routeData = outlet.activatedRouteData['animation'];
        if (!routeData) {
          return 'home';
        };
        return routeData['page'];
      };

    constructor(private vcr: ViewContainerRef, private toastService: ToastService, private appService: AppService, public authUserService: AuthUserService) {
        toastService.toast.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.toastOccurredSub = this.appService.toastOccurred
            .subscribe(
            (toast: Toast) => {
                this.toastService.showToast(toast);
            }
            );
    }

    destroy(sub: any) {
        if (sub) {
            sub.unsubscribe();
            sub = null;
        }
    }

    ngOnDestroy() {
        this.destroy(this.toastOccurredSub);
    }
}