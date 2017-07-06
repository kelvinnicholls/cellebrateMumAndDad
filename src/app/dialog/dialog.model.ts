import { EventEmitter } from "@angular/core";
import { DialogRetEnum } from "./dialog-ret.enum";
export class Dialog {
    constructor(public title: string, public message: string, public buttonOneTitle: string, public buttonTwoTitle: string,public retDialogSub: EventEmitter<DialogRetEnum>) { }
}