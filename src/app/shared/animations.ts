import { stagger, trigger, query, state, style, transition, animate, keyframes } from '@angular/animations';

export const listStateTrigger = trigger('listState', [
    transition('* => *', [
        animate('2s ease-out', keyframes([
            style({
                opacity: 1,
                transform: 'scale(1.05)',
                offset: 0.2
            }),style({
                transform: 'scale(0.95)',
                offset: 0.4
            }), style({
                opacity: 1,
                transform: 'scale(1)',
                offset: 1
            })
        ]))
    ]),
    transition(':enter', [
        animate('2s ease-out', keyframes([
            style({
                opacity: 1,
                transform: 'scale(1.05)',
                offset: 0.2
            }),style({
                transform: 'scale(0.95)',
                offset: 0.4
            }), style({
                opacity: 1,
                transform: 'scale(1)',
                offset: 1
            })
        ]))
    ])]);