import { ViewContainerRef } from "@angular/core";
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Toast } from "./toast.model";
import { Consts } from "../../shared/consts";


@Injectable()
export class ToastService {


    constructor(public toast: ToastsManager, vcr: ViewContainerRef, private router: Router) {
        this.toast.setRootViewContainerRef(vcr);
    }


    //this.toastr.success('You are awesome! Click to view details.', 'Success!', {data: {url: '/path/to/successUrl'}});

    showSuccess(msg: string, options?: any, inTitle?: string) {
        let title = inTitle ? inTitle : 'Success';
        this.toast.success(msg, title, options);
    }

    showError(msg: string, options?: any, inTitle?: string) {
        let title = inTitle ? inTitle : 'Oops!';
        this.toast.error(msg, inTitle, options);
    }

    showWarning(msg: string, options?: any, inTitle?: string) {
        let title = inTitle ? inTitle : 'Alert!';
        this.toast.warning(msg, inTitle, options);
    }

    showInfo(msg: string, options?: any, inTitle?: string) {
        let title = inTitle ? inTitle : 'Info';
        this.toast.info(msg, inTitle, options);
    }

    showCustom(msg: string, options?: any, inTitle?: string) {
        this.toast.custom(msg, inTitle, options);
        //this.toast.custom('<span style="color: red">Message in red.</span>', null, {enableHTML: true});
    }

    showToast(toast: Toast) {
        switch (toast.toastType) {
            case Consts.SUCCESS:
                this.showSuccess(toast.msg);
                break;
            case Consts.ERROR:
                this.showError(toast.msg);
                break;
            case Consts.WARNING:
                this.showWarning(toast.msg);
                break;
            case Consts.INFO:
                this.showInfo(toast.msg);
                break;
            case Consts.CUSTOM:
                this.showCustom(toast.msg);
                break;
        }
    }

}