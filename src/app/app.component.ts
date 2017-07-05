import { Component, ViewContainerRef } from '@angular/core';
import { ToastService } from "./shared/toast/toast.service";
import { AppService } from "./app.service";
import { Toast } from "./shared/toast/toast.model";

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [ToastService]
})
export class AppComponent {

    private toastOccurredSub: any;

    constructor(private vcr: ViewContainerRef, private toastService: ToastService, private appService: AppService) {
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