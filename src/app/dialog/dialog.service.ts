import { EventEmitter } from "@angular/core";

import { DialogRetEnum } from "./dialog-ret.enum";
import { Dialog } from "./dialog.model";

export class DialogService {
    showDialogSub = new EventEmitter<Dialog>();

    showDialog(title: string, message: string, buttonOneTitle: string, buttonTwoTitle: string,  retDialogSub: EventEmitter<DialogRetEnum>) {

        const dialog = new Dialog(title, message, buttonOneTitle, buttonTwoTitle,retDialogSub);
        this.showDialogSub.emit(dialog);
    }
}