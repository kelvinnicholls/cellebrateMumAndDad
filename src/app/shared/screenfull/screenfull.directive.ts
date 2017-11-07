import { Directive, HostListener, ElementRef } from '@angular/core';

//declare var screenfull: any;
import screenfull from './screenfull.js';

@Directive({
    selector: '[toggleFullscreen]'
})
export class ToggleFullscreenDirective {
    constructor(private elementRef: ElementRef) {

    }
    @HostListener('click') onClick() {
        console.log('toggleFullscreen');
        if (screenfull.enabled) {
            screenfull.on("change", () => {
                if (screenfull.isFullscreen) {
                    this.elementRef.nativeElement.style.maxHeight = "100%";
                } else {
                    this.elementRef.nativeElement.style.maxHeight = "50px";
                };
            });
            screenfull.toggle(this.elementRef.nativeElement);
        }
    };
}

