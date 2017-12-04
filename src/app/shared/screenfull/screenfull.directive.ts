import { Directive, HostListener, ElementRef } from '@angular/core';

//declare var screenfull: any;
import * as screenfull from './screenfull.js';
import { Utils, LoglevelEnum, SortDataType } from "../../shared/utils/utils";

//declare var fullscreen;

//declare var screenfull;

@Directive({
    selector: '[toggleFullscreen]'
})
export class ToggleFullscreenDirective {
    private fullscreen: any;
    constructor(private elementRef: ElementRef) {
        this.fullscreen = screenfull;
    }
    //oldMaxHeight = "50px";
    @HostListener('click') onClick() {
        Utils.log(LoglevelEnum.Info,this, 'toggleFullscreen');
        if (this.fullscreen.enabled) {
            // this.fullscreen.on("change", () => {
            //     if (this.fullscreen.isFullscreen) {
            //         this.oldMaxHeight = this.elementRef.nativeElement.style.maxHeight;
            //         Utils.log(LoglevelEnum.Info,this, 'oldMaxHeight', this.oldMaxHeight);
            //         this.elementRef.nativeElement.style.maxHeight = "100%";
            //     } else {
            //         this.elementRef.nativeElement.style.maxHeight = this.oldMaxHeight;
            //         Utils.log(LoglevelEnum.Info,this, 'this.elementRef.nativeElement.style.maxHeight', this.elementRef.nativeElement.style.maxHeight);
            //     };
            // });
            this.fullscreen.toggle(this.elementRef.nativeElement);
        }
    };
}

