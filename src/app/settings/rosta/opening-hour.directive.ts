import { Directive, Input, ElementRef} from '@angular/core';
import { TimeFrame, WeekDay } from 'src/app/openinghours.service';

@Directive({
  selector: '[clOpeningHour]'
})
export class OpeningHourDirective {
  @Input()
  frame: TimeFrame;
  
  @Input()
  weekday: WeekDay;

  @Input()
  weekdayNumber: number;

  constructor(public readonly elementRef: ElementRef) { }
}
