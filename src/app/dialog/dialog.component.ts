import { Component, OnInit, OnDestroy } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { Dialog } from "./dialog.model";
import { DialogRetEnum } from "./dialog-ret.enum";
import { DialogService } from "./dialog.service";

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styles: [`
        .backdrop {
            background-color: rgba(0,0,0,0.6);
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
        }
    `]
})
export class DialogComponent implements OnInit {
    dialog: Dialog;
    display = 'none';
    private showDialogSub: EventEmitter<Dialog>;
    private retDialogSub: EventEmitter<DialogRetEnum>;

    constructor(private dialogService: DialogService) { }

    onClose() {
        this.display = 'none';
        this.dialog.retDialogSub.emit(DialogRetEnum.Close);
    }

    onButtonOne() {
        this.display = 'none';
        this.dialog.retDialogSub.emit(DialogRetEnum.ButtonOne);
    }

    onButtonTwo() {
        this.display = 'none';
        this.dialog.retDialogSub.emit(DialogRetEnum.ButtonTwo);
    }

    ngOnInit() {
        this.showDialogSub = this.dialogService.showDialogSub
            .subscribe(
            (dialog: Dialog) => {
                this.dialog = dialog;
                this.display = 'block';
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
        this.destroy(this.showDialogSub);
        this.destroy(this.retDialogSub);
    }
}