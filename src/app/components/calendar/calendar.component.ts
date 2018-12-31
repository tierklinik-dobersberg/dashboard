import {Component, OnInit, AfterViewInit, ViewChildren, ContentChildren, QueryList, ElementRef, ChangeDetectorRef, TemplateRef, Input, OnDestroy, AfterContentInit, AfterViewChecked, Output, EventEmitter} from '@angular/core';
import * as moment from 'moment';
import {WeekDay, TimeFrame} from 'src/app/openinghours.service';
import {TdDaySectionDef, TdDayScheduleDef} from './day-section';
import {Subscription} from 'rxjs';
import {DateSpan, DaySection, CalendarDay, Schedule} from './types';
import {CalendarSource, CalendarViewer} from './calendar-source';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import { MediaMatcher } from '@angular/cdk/layout';

/**
 * @internal
 * A DaySection extended with rendering information like offset top and it
 * height
 */
interface PositionedDaySection extends DaySection<any> {
  position: {
    top: number;
    height: number;
    opacity: number;
  },
  template: TemplateRef<any>
}

interface PositionedDaySchedule extends Schedule<any> {
  position: {
    top: number;
    height: number;
    opacity: number;
    width?: number;
    left: number;
  },
  template: TemplateRef<any>
}

type Positioned<T> = T extends DaySection<any> ? PositionedDaySection : PositionedDaySchedule;

export interface TdCalendarClickEvent {
  date: Date;
  end?: Date;
  position: {
    x: number;
    y: number;
  },
  schedule?: Schedule<any>
}

export type WeekendConfig = 'none' | 'saturday' | 'all';

/**
 * Describes a day to be rendered at the calendar
 */
export interface Day {
  /** The full date for the day */
  date: moment.Moment;
  
  /** The string representation of the day. Currently only the german locale */
  name: string;
  
  /** The weekday number (0 - 6) */
  weekDayNumber: number;
  
  /** The weekday key */
  weekDay: WeekDay;

  sections: PositionedDaySection[];
  
  schedules: PositionedDaySchedule[];
  
  columns: Schedule<any>[][];
}

@Component({
  selector: 'td-calendar',
  exportAs: 'tdCalendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class TdCalendarComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit, AfterViewChecked, CalendarViewer {
  /**
   * @internal
   * The earliest opening hour start in the week
   */
  private _earliestStart: number = -1;
  
  /**
   * @internal
   * The latests opening hour end in the week
   */
  private _latestEnd: number = -1;
  
  /**
   * @internal
   * The next CalendarSource to use after the view has been checked
   */
  private _nextSource: CalendarSource | null = null;
  
  /**
   * @internal
   * A snapshot of the currently rendered day sections. Each DaySection may be rendered differently
   * based on the "when" predicate condition of {@link TdDaySectionDef}
   */
  private _calendarDaysSnapshort: ReadonlyArray<CalendarDay> = [];
  
  /**
   * @internal
   * The current CalendarSource in use. May change if {@link TdCalendarComponent#_nextSource} is
   * set and the view has been checked 
   */
  private _currentSource: CalendarSource | null = null;
  
  /**
   * @internal
   * The subscription to the {@link TdCalendarComponent#_source} calendar source
   */
  private _sourceSubscription: Subscription = Subscription.EMPTY;
  
  /**
   * @internal
   * The minimum height of a day container
   */
  private _minContainerHeight: number | null = null;

  /**
   * @internal
   * The media query list for the {@link MediaMatcher}
   */
  private _mediaQuery: MediaQueryList | null = null;
  
  private _mediaListener: () => void;

  /**
   * @internal
   * Returns the number of days rendered
   */
  private get _numberOfDays(): number {
    switch (this._weekendConfig) {
    case 'none':
      return 5;
    case 'saturday':
      return 6;
    case 'all':
      return 7;
    }
  }

  /**
   * Whether or not the calendar can be clicked
   */
  @Input()
  set allowClick(v: any) {
    this._allowClick = coerceBooleanProperty(v);
  }
  get allowClick() { return this._allowClick; }
  private _allowClick: boolean = true;
  

  /**
   * Configures which days of the weekend should be rendered
   */
  @Input()
  set weekendDays(cfg: WeekendConfig) {
    this._weekendConfig = cfg;
    
    requestAnimationFrame(() => this._changeDate(this._currentDate));
  }
  get weekendDays() {
    return this._weekendConfig;
  }
  private _weekendConfig: WeekendConfig = 'all';
  
  /**
   * Input for the calendar source
   * @see CalendarSource
   */
  @Input()
  set source(calSrc: CalendarSource) {
    this._nextSource = calSrc;
  }
  get source() { return this._currentSource; }
  
  /**
   * Emits an DateSpan whenever the currently viewed week changes
   * @see CalendarViewer
   */
  @Output()
  readonly viewChange: EventEmitter<DateSpan> = new EventEmitter();
  
  /**
   * Emits a {@link TdCalendarClickEvent} when the user clicks inside the
   * calendar. Depends on the value of the {@link TdCalendarComponent#allowClick}
   * property
   */
  @Output()
  readonly onClick: EventEmitter<TdCalendarClickEvent> = new EventEmitter();
  
  /**
   * Returns the current date span that is shown in the calendar
   */
  get currentDateSpan(): DateSpan {
    return this._currentDate;
  }
  
  /**
   * @internal
   * A query list watching day section definitions for the calendar
   */
  @ContentChildren(TdDaySectionDef)
  _daySectionDefinitions: QueryList<TdDaySectionDef>;
  
  /**
   * @internal
   * A query list watching schedule template definitions for the calendar
   */
  @ContentChildren(TdDayScheduleDef)
  _dayScheduleDefinitions: QueryList<TdDayScheduleDef>;

  /**
   * The currently rendered ISO calendar week
   */
  currentWeek: number;
  
  /**
   * The current year displayed in the calendar
   */
  currentYear: number;
  
  /**
   * A string represenation of the current time span displayed in the calendar
   */
  currentTimeSpan: string;
  
  /**
   * @internal 
   * The current date displayed in the calendar. It may be in the middle of the week
   */
  _currentDate: DateSpan|null = null;
  
  /**
   * @internal
   * A query list watching all 7 weekdays (startin with monday) 
   */
  @ViewChildren('weekDayContainer', {read: ElementRef})
  _calendarContainer: QueryList<ElementRef>;
  
  /**
   * @internal
   * A list of days to be rendered in the calendar
   */
  _days: Day[] = [];
  
  constructor(private _changeDetectorRef: ChangeDetectorRef,
              private _mediaMatcher: MediaMatcher) {}

  ngOnInit() {
    this._mediaQuery = this._mediaMatcher.matchMedia('(max-width: 600px)');

    this._mediaListener = () => {
      this._changeDetectorRef.detectChanges();
    };

    this._mediaQuery.addListener(this._mediaListener);

    this._setupCalendarSource();
    this.openTodaysWeek();
  }
  
  ngOnDestroy() {
    this._mediaQuery!.removeListener(this._mediaListener);

    if (!!this._sourceSubscription) {
      this._sourceSubscription.unsubscribe();
      this._sourceSubscription = null;
    }
    
    if (!!this._currentSource) {
      this._currentSource.disconnect(this);
    }
  }

  ngAfterViewInit() {
    // We need to trigger a new change detection round
    this._changeDetectorRef.detectChanges();
    
    this._calendarContainer.changes
      .subscribe(() => {
        this._getAndCacheContainerHeight();
        this._updateDaySections();
      });
  }

  ngAfterViewChecked() {
    if (this._currentDate === null) {
      return;
    }
    this._setupCalendarSource();
  }
  
  ngAfterContentInit() {
    this._daySectionDefinitions.changes
      .subscribe(changes => {
        this._updateDaySections();
      });

    this._dayScheduleDefinitions.changes
      .subscribe(changes => {
        this._updateDaySections();
      })
  }

  /**
   * Realigns and recalulates the position of sections and schedules
   */
  realign() {
    this._changeDate(this._currentDate);
  }
  
  /**
   * Switches the calendar to display the current week
   */
  openTodaysWeek() {
    this.openFromDate(new Date());
  }
  
  /**
   * Switches the calendar to display the week of the provided day
   * 
   * @param d - The date to switch to
   */
  openFromDate(d: Date) {
    this._setCurrentDate(d);    
    // As this function may be called from outside the component
    // make sure we trigger a new change detection round
    this._changeDetectorRef.markForCheck();
  }

  /**
   * @internal
   * Callback function for click events within a day container
   */
  _handleClick(event: MouseEvent, day: Day, schedule?: Schedule<any>, section?: DaySection<any>) {
    if (!this._allowClick) {
      return;
    }
    
    event.preventDefault();
    event.cancelBubble = true;
    
    let start: Date | null = null;
    let end: Date | null = null;
    
    if (!!section || !!schedule) {
      if (!section) {
        section = schedule;
      }
    
      start = day.date.clone().startOf('day').add(section.start.totalMinutes, 'minutes').toDate();
      end = day.date.clone().startOf('day').add(section.end.totalMinutes, 'minutes').toDate();
    }
    
    let e: TdCalendarClickEvent = {
      date: start || this._calculateClickTime(event, day.date),
      end: end || undefined,
      position: {
        x: event.x,
        y: event.y 
      } ,
      schedule: schedule
    };
    
    this.onClick.next(e);
  }

  /**
   * @internal
   * Given a reference date and a mouse click event this function returns
   * a new Date with hours and minutes based on the events click coordinates
   * 
   * @param event - The MouseEvent emitted by the mouse click
   * @param d - The date of the date
   */
  private _calculateClickTime(event: MouseEvent, d: Date|moment.Moment): Date  {
    if (moment.isDate(d)) {
      d = moment(d);
    }
    
    const offsetY = event.y - this._calendarContainer.toArray()[0].nativeElement.getBoundingClientRect().top;
    const minutesPerDay = this._latestEnd - this._earliestStart;
    const minutesPerPixel = minutesPerDay / this._minContainerHeight;
    const offsetMinutes = Math.ceil(minutesPerPixel * offsetY);
    const minutes = offsetMinutes + this._earliestStart;
    
    const date = d.clone()
      .startOf('day')
      .add(minutes, 'minutes');

    return date.toDate();
  }

  /**
   * @internal
   * @see TrackByFunction
   * 
   * @param idx - The current index. unused
   * @param day - The {@link Day} to track
   */
  _trackDays(idx: number, day: Day) {
    return day.weekDayNumber;
  }
  
  /**
   * @internal
   * @see TrackByFunction
   * 
   * @param idx - The current index. unused
   * @param frame - The time frame
   */
  _trackFrame(idx: number, frame: TimeFrame) {
    return frame.id;
  }

  /**
   * @internal
   * Listener for window resize events
   * 
   * @param event - The resize event
   */
  _onResize(event?: any) {
    requestAnimationFrame(() => {
      this._getAndCacheContainerHeight();
      this._updateDaySections();
    });
  }
  
  /**
   * @internal
   * Changes the calendar to the next week
   */
  openNextWeek() {
    const next = moment(this._currentDate.endDate)
                  .add(1, 'week');
    this._setCurrentDate(next.toDate());
  }
  
  /**
   * @internal
   * Changes to calendar to the previous week
   */
  openPrevWeek() {
    const next = moment(this._currentDate.endDate)
                  .add(-1, 'week');
    
    this._setCurrentDate(next.toDate());
  }
  
  /**
   * Sets the new date span for the calendar and emits an event on the viewChange
   * property
   * 
   * @param d - The new date that should be displayed. May be in the middle of a week
   */
  private _setCurrentDate(d: Date) {
    let nextDate = this._getDateSpan(d);
    
    if (!!this._currentDate && 
        nextDate.startDate.getTime() === this._currentDate.startDate.getTime() &&
        nextDate.endDate.getTime() === this._currentDate.endDate.getTime()) {
      return;
    }

    this._currentDate = nextDate;
    this.viewChange.next(this._currentDate);
  }
  
  /**
   * @internal
   * Iterates of all day containers and finds the smallest one
   */
  private _getAndCacheContainerHeight(): void {
    if (!this._calendarContainer) {
      return;
    }
    
    if (this._calendarContainer.length === 0) {
      return;
    }
    
    let min = this._calendarContainer.toArray()[0].nativeElement.clientHeight;
    this._calendarContainer.forEach(container => {
      const height = container.nativeElement.clientHeight;
      if (height < min) {
        min = height;
      }
    });
    
    this._minContainerHeight = min;
  }
  
  /**
   * @internal
   * Subscribes to a new calendar source at {@link TdCalendarComponent#_source}
   * and removes any previous source subscription
   */
  private _setupCalendarSource(): void {
    if (!this._nextSource) {
      return;
    }
    
    // Unsubscribe from the previous source
    if (!!this._sourceSubscription) {
      this._sourceSubscription.unsubscribe();
      this._sourceSubscription = Subscription.EMPTY;
    }

    // and disconnect ourself
    if (!!this._currentSource) {
      this._currentSource.disconnect(this);
      this._currentSource = null;
    }
    
    if (!this._nextSource) {
      return;
    }
    
    // Make sure we only accept valid CalendarSource implementations
    if ((typeof this._nextSource['connect'] !== 'function') ||
        (typeof this._nextSource['disconnect'] !== 'function')) {

        throw new Error(`TdCalendarComponent: received invalid calendar source. It MUST implement the CalendarSource interface`);
    }
    
    this._currentSource = this._nextSource;
    this._nextSource = null;

    // Connect to the current source
    this._sourceSubscription = this._currentSource.connect(this)
      .subscribe(calendarDays => {
        this._calendarDaysSnapshort = calendarDays;
        this._updateDayLength();
        this._changeDate(this._currentDate);

        this._changeDetectorRef.detectChanges();
      });
  }
  
  /**
   * @internal
   * Iterates of all DaySections and calculates the earliest start and the latest end for the
   * whole week.
   */
  private _updateDayLength(): void {
    // find the earliest start and latest end times
    this._earliestStart = -1;
    this._latestEnd = -1;

    this._calendarDaysSnapshort.forEach(day => {
      (day.sections || []).forEach(frame => {
        if (this._earliestStart === -1 || frame.start.totalMinutes < this._earliestStart) {
          this._earliestStart = frame.start.totalMinutes;
        }
        
        if (this._latestEnd === -1 || frame.end.totalMinutes > this._latestEnd) {
          this._latestEnd = frame.end.totalMinutes;
        }
      });
      
      (day.schedules || []).forEach(frame => {
        if (this._earliestStart === -1 || frame.start.totalMinutes < this._earliestStart) {
          this._earliestStart = frame.start.totalMinutes;
        }
        
        if (this._latestEnd === -1 || frame.end.totalMinutes > this._latestEnd) {
          this._latestEnd = frame.end.totalMinutes;
        }
      });
    });

    if (this._earliestStart > 30) {
      this._earliestStart -= 30;
    }

    if (this._latestEnd < 24*60 - 60) {
      this._latestEnd += 60;
    }
  }
  
  /**
   * @internal
   * Given a reference date this function returns a {@link DateSpan} that covers
   * the week of the given date (with monday being the first day of the week)
   * 
   * @param d - The date reference
   */
  private _getDateSpan(d: Date): DateSpan {
    const m = moment(d);
    
    return {
      startDate: m.startOf('isoWeek').toDate(),
      endDate: m.endOf('isoWeek').toDate()
    }
  }
  
  /**
   * @internal
   * Update internal fields to reflect the new week to display
   * in the calendar
   * 
   * @param date - The new start date of the calendar
   */
  private _changeDate(date: DateSpan) {
    let result = moment(date.startDate).isoWeek();
    this.currentTimeSpan = this._getMonthName(date.startDate);
    this.currentWeek = result;
    this.currentYear = moment(date.startDate).isoWeekYear();
    this._generateDays(date.startDate);
  }

  /**
   * Perpares the {@link TdCalendarComponent#_currentTimeSpan} string property to represent the current
   * time span displayed at the calendar
   *
   * Normally this function sets the value to `${startOfWeek}. - ${endOfWeek}. ${currentMonth}`
   * If the week spans two months (i.e. the start of the week is in a different month than the end
   * of the week), it will set the value to `${startOfWeek}. ${startMonth} - ${endOfWeek}. ${endMonth}`
   */
  private _getMonthName(date: Date) {
    const monthNames = [
      'Jänner',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember'
    ];
    
    const m = moment(date)
    const startOfWeek = m.clone().isoWeekday(1);
    const endOfWeek = m.clone().isoWeekday(7);
    const current = monthNames[m.month()];
    const end = monthNames[endOfWeek.month()];
    
    if (current !== end) {
      return `${startOfWeek.date()}. ${current} - ${endOfWeek.date()}. ${end}`;
    }
    
    return `${startOfWeek.date()}. - ${endOfWeek.date()}. ${current}`;
  }
  
  /**
   * Converts a weekday number into it's key/string representation
   * 
   * @param day - The number of the weekday (sunday = 0; saturday = 6)
   */
  private _getWeekDayFromNumber(day: number): WeekDay {
    let keys: WeekDay[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    
    return keys[day];
  }

  /**
   * @internal
   * Generates the list of days for the {@link TdCalendarComponent#_days} property
   * based on a given date
   *
   * @param d - A date or moment that is used to determine the date range to create;
   *            it may be in the middle of a week
   */
  private _generateDays(d: Date|moment.Moment) {
    if (moment.isDate(d)) {
      d = moment(d);
    }
    
    d.startOf('isoWeek');
      
    let days: Day[] = [];
    let names = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

    for(let i = 0; i < this._numberOfDays; i++) {
      const weekDay = i + 1;
      const name = names[i];
      const date = d.clone()
                    .add(i, 'day');
        
      const calendarDay = this._calendarDaysSnapshort.find(day => moment(day.date).date() === date.date());
      const section = !!calendarDay ? calendarDay.sections || [] : [];
      const schedules = !!calendarDay ? calendarDay.schedules || [] : [];

      const columns = this._calculateColumns(schedules);

      days.push({
        date: date,
        name: name,
        weekDayNumber: weekDay,
        weekDay: this._getWeekDayFromNumber(i),
        sections: section.map(section => this._positionSection('section', weekDay, section)),
        schedules: schedules.map(schedule => this._positionSection('schedule', weekDay, schedule, columns)),
        columns: columns,
      });
    }

    this._days = days;
  }

  /**
   * @internal
   * Checks whether schedule a overlaps with schedule b
   * 
   * @param a - The schedule to check if it overlaps with b
   * @param b - The second schedule for the check
   */
  private _overlapsSchedule(a: Schedule<any>, b: Schedule<any>): boolean {
    const startA = a.start.totalMinutes;
    const endA = a.end.totalMinutes;
    const startB = b.start.totalMinutes;
    const endB = b.end.totalMinutes;

    return (startB >= startA && startB <= endA) ||
           (endB   <= endA   && endB   >= startA) ||
           (startA >= startB && startA <= startB) ||
           (endA   <= endB   && endA   >= startB)
  }

  /**
   * @internal
   * Aligns a list of schedule into a list of columns based on overlapping
   * schedules. The number of columns is minimized
   * 
   * @param schedules - The list of schedules
   */
  private _calculateColumns(schedules: Schedule<any>[]): Schedule<any>[][] {
    // we need at least one column
    let ordered = [...schedules].sort((a, b) => a.start.totalMinutes - b.start.totalMinutes) 
    let columns: Schedule<any>[][] = [[]];
    
    ordered.forEach(schedule => {
        let currentColumnIndex = 0;
        while(true) {
          if (!columns[currentColumnIndex].some(b => this._overlapsSchedule(schedule, b))) {
            columns[currentColumnIndex].push(schedule);
            break;
          }
          
          currentColumnIndex++;
          if (columns.length <= currentColumnIndex) {
            columns.push([]);
          }
        }
    });
    
    return columns;
  }
  
  /**
   * @internal
   * 
   * Iterates of all calendar days and updates the position of the day sections as well as the
   * day section template to use
   * This function should be called whenever the container height changes or the day section
   * definition changes
   */
  private _updateDaySections() {
    this._days = this._days.map(day => {
      return {
        ...day,
        sections: day.sections.map(section => this._positionSection('section', day.weekDayNumber, section)),
        schedules: day.schedules.map(schedule => this._positionSection('schedule', day.weekDayNumber, schedule, day.columns))
      }
    });
  }

  /**
   * @internal
   * 
   * Calculates the top and height for a day section based on the current container
   * height and the earliest start and latest end of day sections during the week 
   * @param section 
   */
  private _positionSection(type: 'section', weekDay: number, section: DaySection<any>): PositionedDaySection;
  private _positionSection(type: 'schedule', weekDay: number, section: Schedule<any>, columns?: Schedule<any>[][]): PositionedDaySchedule;
  private _positionSection<T>(type: 'section'|'schedule', weekDay: number, section: any, columns?: Schedule<any>[][]): Positioned<T> {
    let template: TdDayScheduleDef | TdDaySectionDef | undefined = undefined; 
    
    switch(type) {
    case 'section':
      template = this._daySectionDefinitions.find(item => item.when(section));
      break;
    case 'schedule':
      template = this._dayScheduleDefinitions.find(item => item.when(section));
      break;
    }

    let width: number | null = null;
    let left: number = 0;

    if (this._minContainerHeight === null) {
      return {
        ...section,
        position: {
          top: 0,
          height: 0,
          opacity: 0,
          left: 0,
          width: width,
        },
        template: !!template ? template.templateRef : null
      };
    }
      
    // For schedules, we need to take care about overlapping ones
    // and adjust their left position and width accordingly
    if (type === 'schedule')  {
      let layout = this._calculateScheduleLayout(weekDay, section, columns);
      width = layout.width;
      left = layout.left;
    }
    
    const minutesPerDay = this._latestEnd - this._earliestStart;
    const duration = section.end.totalMinutes - section.start.totalMinutes;
    const startTime = section.start.totalMinutes - this._earliestStart;
    const pixelPerMinute = this._minContainerHeight / minutesPerDay;
    const hourTop = Math.floor(pixelPerMinute * startTime);
    const hourHeight = Math.floor(pixelPerMinute * duration);

    return {
      ...section,
      position: {
        top: hourTop,
        height: hourHeight,
        opacity: 1,
        width: width,
        left: left,
      },
      template: !!template ? template.templateRef : null
    }
  }  
  
  private _calculateScheduleLayout(weekDay: number, schedule: Schedule<any>, columns: Schedule<any>[][]): { width: number; left: number } {
    const id = weekDay;
    const container = this._calendarContainer.toArray()[id];
    const containerWidth = container.nativeElement.clientWidth;
    
    let columnIndex = columns.findIndex(col => {
      return col.some(sched => sched.id === schedule.id);
    });
    
    let skipColumns = 0;
    columns.slice(columnIndex + 1).forEach(col => {
      if (!col.some(sched => this._overlapsSchedule(schedule, sched))) {
        skipColumns++;
      }
    });

    const percentPerPixel = 100 / containerWidth
    
    const left = percentPerPixel * (columnIndex * (containerWidth / (columns.length - skipColumns)));
    const width = percentPerPixel * ((containerWidth / (columns.length - skipColumns)));
    
    return { width, left };
  }
}


/**
 * Returns a tuple of the current UTC year as well as the ISO week number
 *
 * @param d - The date to return the year and week number
 */
function getWeekNumber(d: Date): [number, number] {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return [d.getUTCFullYear(), weekNo];
}