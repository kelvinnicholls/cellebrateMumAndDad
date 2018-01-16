import { stagger, trigger, query, state, style, transition, animate, keyframes } from '@angular/animations';

export const listStateTrigger = trigger('listState', [
    transition('* => *', [
        animate('0.5s ease-out', keyframes([
            style({
                opacity: 1,
                transform: 'scale(1.5)',
                offset: 0.4
            }), style({
                opacity: 1,
                transform: 'scale(1)',
                offset: 1
            })
        ]))
    ])]);