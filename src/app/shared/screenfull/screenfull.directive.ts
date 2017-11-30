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
    private fullscreen : any;
    constructor(private elementRef: ElementRef) {
        this.fullscreen = screenfull;
    }
    @HostListener('click') onClick() {
        Utils.log(LoglevelEnum.Info,'toggleFullscreen');
        if (this.fullscreen.enabled) {
            this.fullscreen.on("change", () => {
                let oldMaxHeight = "50px";
                if (this.fullscreen.isFullscreen) {
                    oldMaxHeight = this.elementRef.nativeElement.style.maxHeight;
                    this.elementRef.nativeElement.style.maxHeight = "100%";
                } else {
                    this.elementRef.nativeElement.style.maxHeight = oldMaxHeight;
                };
            });
            this.fullscreen.toggle(this.elementRef.nativeElement);
        }
    };
}

