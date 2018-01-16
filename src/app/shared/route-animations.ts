import { group, query, trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const routeStateSlideInTrigger = trigger('routeStateSlideIn', [
    transition('* => *', [
        group([
            query(':enter', [
                style({
                    opacity: 0,
                    transform: 'translateY(-100%)'
                }),
                animate('1s ease-in')
            ], { optional: true }),
            query(':leave', [
                animate('1s ease-out', style({
                    opacity: 0,
                    transform: 'translateY(100%)'
                }))
            ], { optional: true })
        ])

    ])
]);