import { EventEmitter } from "@angular/core";
import { Toast } from "./shared/toast/toast.model";



export class AppService {
    toastOccurred = new EventEmitter<Toast>();

    showToast(toastType: string,msg: string) {
        const toastData = new Toast(toastType, msg);
        this.toastOccurred.emit(toastData);
    }
}