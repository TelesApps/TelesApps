import { trigger, animate, transition, style, query, group } from '@angular/animations';

export const slide =
  trigger('routeAnimations', [
    transition('home => front-end', slideTo('right')),
    transition('home => back-end', slideTo('right')),
    transition('home => database', slideTo('right')),
    transition('home => ai', slideTo('right')),
    transition('home => contact' , slideTo('right')),
    transition('front-end => back-end', slideTo('right')),
    transition('front-end => database', slideTo('right')),
    transition('front-end => ai', slideTo('right')),
    transition('front-end => contact', slideTo('right')),
    transition('back-end => database', slideTo('right')),
    transition('back-end => ai', slideTo('right')),
    transition('back-end => contact', slideTo('right')),
    transition('database => ai', slideTo('right')),
    transition('database => contact', slideTo('right')),
    transition('ai => contact', slideTo('right')),
    // Left Slides
    transition('contact => ai', slideTo('left')),
    transition('contact => database', slideTo('left')),
    transition('contact => back-end', slideTo('left')),
    transition('contact => front-end', slideTo('left')),
    transition('contact => home', slideTo('left')),
    transition('ai => database', slideTo('left')),
    transition('ai => back-end', slideTo('left')),
    transition('ai => front-end', slideTo('left')),
    transition('database => back-end', slideTo('left')),
    transition('database => front-end', slideTo('left')),
    transition('back-end => front-end', slideTo('left')),
    transition('front-end => home', slideTo('left')),
    transition('back-end => home', slideTo('left')),
    transition('database => home', slideTo('left')),
    transition('ai => home', slideTo('left')),
    transition('* => home', fadeIn()),
  ]);

  function slideTo(direction: string) {
    const optional = { optional: true };
    const towardsRight = direction === 'right';
    const enterStart = towardsRight ? '100%' : '-100%';
    const leaveEnd = towardsRight ? '-100%' : '100%';
  
    return [
      query(':enter, :leave', [
        style({
          position: 'fixed', 
          top: 80,
          bottom: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        })
      ], optional),
      query(':enter', [
        style({ transform: `translateX(${enterStart})` })
      ]),
      group([
        query(':leave', [
          animate('600ms ease', style({ transform: `translateX(${leaveEnd})`, opacity: 0 }))
        ], optional),
        query(':enter', [
          style({ transform: `translateX(${enterStart})`, opacity: 0 }),
          animate('600ms ease', style({ transform: 'translateX(0%)', opacity: 1 }))
        ])
      ]),
    ];
  }

  function fadeIn() {
    return [
      // Initially, the entering element is fully transparent
      query(':enter', [
        style({ opacity: 0 })
      ]),
      // Animate the opacity to 1 (fully visible) over a duration of 600ms
      query(':enter', [
        animate('600ms ease', style({ opacity: 1 }))
      ])
    ];
  }