import { group, query, trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const routeStateTrigger = trigger('routeState', [
    transition('*=>*', [
        style({
            opacity: 0,
            transform: 'scale(0)'
        }),
        animate('0.5s ease-in')
    ])
]);