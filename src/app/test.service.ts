import { DebugElement } from '@angular/core';
import { Observable } from 'rxjs';
export class TestService {

    static sendInput(inputElement: any, text: string, fixture: any) {
        inputElement.value = text;
        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        return fixture.whenStable();
    }

    static ButtonClickEvents = {
        left: { button: 0 },
        right: { button: 2 }
    };

    /** Simulate element click. Defaults to mouse left-button click event. */
    static click(el: DebugElement | HTMLElement, eventObj: any = TestService.ButtonClickEvents.left): void {
        if (el instanceof HTMLElement) {
            el.click();
        } else {
            el.triggerEventHandler('click', eventObj);
        }
    }

    static getObservable(retVal: any) {
        return Observable.create(observer => {
            observer.next(retVal);
            observer.complete();
        });
    }

}


