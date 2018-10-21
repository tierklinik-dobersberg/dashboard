import { Component, OnInit, AfterViewInit, ViewChildren, ContentChildren, QueryList, ElementRef, ChangeDetectorRef, Input, OnDestroy, AfterViewChecked, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { Time, OpeningHoursService, OpeningHoursConfig, WeekDay, TimeFrame } from 'src/app/openinghours.service';
import {TdDaySectionDef, TdDaySectionOutlet} from './day-section';
import {OpeningHourDirective} from './opening-hour.directive';
import {Subscription} from 'rxjs';
import {DateSpan, DaySection, CalendarDay} from './types';
import {CalendarSource, CalendarViewer} from './calendar-source';

/**
 * Describes a day to be rendered at the rosta
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
  

  sections: DaySection<any>[];
}

@Component({
  selector: 'cl-rosta-edit',
  templateUrl: './rosta.component.html',
  styleUrls: ['./rosta.component.scss']
})
export class RostaComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked, CalendarViewer {
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
   * The current CalendarSource in use. May change if {@link RostaComponent#_nextSource} is
   * set and the view has been checked 
   */
  private _currentSource: CalendarSource | null = null;
  
  /**
   * @internal
   * The subscription to the {@link RostaComponent#_source} calendar source
   */
  private _sourceSubscription: Subscription = Subscription.EMPTY;
  
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
   * @internal
   * A query list watching day section definitions for the calendar
   */
  @ContentChildren(TdDaySectionDef)
  _daySectionDefinitions: QueryList<TdDaySectionDef>;

  /**
   * @internal
   * The currently rendered ISO calendar week
   */
  _currentWeek: number;
  
  /**
   * @internal
   * The current year displayed in the rosta
   */
  _currentYear: number;
  
  /**
   * @internal
   * A string represenation of the current time span displayed in the rosta
   */
  _currentTimeSpan: string;
  
  /**
   * @internal 
   * The current date displayed in the rosta. It may be in the middle of the week
   */
  _currentDate: Date;
  
  /**
   * @internal
   * A query list watching all 7 weekdays (startin with monday) 
   */
  @ViewChildren('weekDayContainer', {read: ElementRef})
  _calendarContainer: QueryList<ElementRef>;


  /**
   * @deprecated
   * A query list watching all {@link OpeningHourDirective}s rendered at the rosta
   */
  @ViewChildren(OpeningHourDirective)
  _openingHourDirectives: QueryList<OpeningHourDirective>;

  /**
   * @deprecated
   * The current opening hours
   */
  _openingHours: OpeningHoursConfig = {};
  
  /**
   * @internal
   * A list of days to be rendered in the rosta
   */
  _days: Day[] = [];
  
  constructor(private _openingService: OpeningHoursService,
              private _changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.openTodaysWeek();
    //this._loadOpeningHours();
  }
  
  ngOnDestroy() {
    if (!!this._sourceSubscription) {
      this._sourceSubscription.unsubscribe();
      this._sourceSubscription = null;
    }
    
    if (!!this._currentSource) {
      this._currentSource.disconnect(this);
    }
  }

  ngAfterViewInit() {
    this._openingHourDirectives.changes
      .subscribe(() => {
        this._alignDaySections();
      });
  }

  ngAfterViewChecked() {
    this._setupCalendarSource();
  }
  
  /**
   * Switches the rosta to display the current week
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
    this._changeDate(d);
    
    // As this function may be called from outside the component
    // make sure we trigger a new change detection round
    this._changeDetectorRef.markForCheck();
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
    this._alignDaySections();
  }
  
  /**
   * @internal
   * Changes the rosta to the next week
   */
  _openNextWeek() {
    const next = moment(this._currentDate)
                  .add(1, 'week');
    
    this._changeDate(next.toDate());
  }
  
  /**
   * @internal
   * Changes to rosta to the previous week
   */
  _openPrevWeek() {
    const next = moment(this._currentDate)
                  .add(-1, 'week');
    
    this._changeDate(next.toDate());
  }
  
  /**
   * @internal
   * Subscribes to a new calendar source at {@link RostaComponent#_source}
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

        throw new Error(`RostaComponent: received invalid calendar source. It MUST implement the CalendarSource interface`);
    }
    
    this._currentSource = this._nextSource;
    this._nextSource = null;

    // Connect to the current source
    this._sourceSubscription = this._currentSource.connect(this)
      .subscribe(calendarDays => {
        this._calendarDaysSnapshort = calendarDays;
        this._changeDate(new Date());

        // find the earliest start and latest end times
        this._earliestStart = -1;
        this._latestEnd = -1;

        calendarDays.forEach(day => {
          (day.sections || []).forEach(frame => {
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
        
        this._alignDaySections();
      });
  }
  
  /**
   * @internal
   * Update internal fields to reflect the new week to display
   * in the rosta
   * 
   * @param date - The new start date of the rosta
   */
  private _changeDate(date: Date) {
    // If the date passed is a sunday we actually need to display
    // the "last" week
    if (date.getDay() === 0) {
      date = moment(date).subtract(1, 'day').toDate();
    }
    
    let result = getWeekNumber(date);
    this._currentDate = date;
    this._currentTimeSpan = this._getMonthName(date);
    this._currentWeek = result[1];
    this._currentYear = result[0];
    this._generateDays(this._currentDate);
  }

  /**
   * @internal
   * Updates the position of the day section DOM elements
   */
  private _alignDaySections() {
    this._openingHourDirectives.forEach((directive, index) => {
      
      let id = directive.weekdayNumber - 1;
      if (id < 0) { id = 6; }
      
      const minutesPerDay = this._latestEnd - this._earliestStart;
      const container = this._calendarContainer.toArray()[id];
      const height = container.nativeElement.clientHeight;
      
      const duration = directive.frame.end.totalMinutes - directive.frame.start.totalMinutes;
      const startTime = directive.frame.start.totalMinutes - this._earliestStart;
      let pixelPerMinute = height / minutesPerDay;
      
      const hourTop = Math.floor(pixelPerMinute * startTime);
      const hourHeight = Math.floor(pixelPerMinute * duration);
      
      directive.elementRef.nativeElement.style.top = hourTop + 'px';
      directive.elementRef.nativeElement.style.height = hourHeight + 'px';
    });
  }

  /**
   * Perpares the {@link RostaComponent#_currentTimeSpan} string property to represent the current
   * time span displayed at the rosta
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
    const startOfWeek = m.clone().weekday(1);
    const endOfWeek = m.clone().weekday(6).add(1, 'day');
    const current = monthNames[m.month()];
    const end = monthNames[endOfWeek.month()];
    
    if (current !== end) {
      return `${startOfWeek.date()}. ${current} - ${endOfWeek.date()}. ${end}`;
    }
    
    return `${startOfWeek.date()}. - ${endOfWeek.date()}. ${current}`;
  }

  /**
   * @deprecated
   * Loads the current opening hours, calculates the earlies start and the latest end within the
   * week and realigns the opening hour containers using {@link RostaComponent#_realignOpeningHours()}
   */
  private _loadOpeningHours() {
    this._openingService.getConfig()
      .subscribe(config => {
        this._openingHours = config;

        Object.keys(this._openingHours)
          .forEach(key => {
            const frames = this._openingHours[key];
            
            frames.forEach(frame => {
              if (this._earliestStart === -1 || frame.start.totalMinutes < this._earliestStart) {
                this._earliestStart = frame.start.totalMinutes;
              }
              
              if (this._latestEnd === -1 || frame.end.totalMinutes > this._latestEnd) {
                this._latestEnd = frame.end.totalMinutes;
              }
            })
          });
          
          if (this._earliestStart > 30) {
            this._earliestStart -= 30;
          }
          
          if (this._latestEnd < 24*60 - 60) {
            this._latestEnd += 60;
          }

          if (!!this._calendarContainer) {
            this._alignDaySections();
          }
      });
  }
  
  /**
   * @internal
   * Generates the list of days for the {@link RostaComponent#_days} property
   * based on a given date
   *
   * @param d - A date or moment that is used to determine the date range to create;
   *            it may be in the middle of a week
   */
  private _generateDays(d: Date|moment.Moment) {
    if (moment.isDate(d)) {
      d = moment(d);
    }
    
    d.weekday(0).startOf('day');
      
    let days: Day[] = [];
    let names = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

    for(let i = 0; i < 7; i++) {
      // we start with monday so sunday actuall needs to display the next week
      const weekDay = i + 1;
      const name = names[i];
      const date = d.clone()
                    .add(weekDay, 'day');
        
      const calendarDay = this._calendarDaysSnapshort.find(day => moment(day.date).date() === date.date());
      const section = !!calendarDay ? calendarDay.sections || [] : [];

      days.push({
        date: date,
        name: name,
        weekDayNumber: weekDay,
        weekDay: this._openingService.getKeyFromDay(weekDay),
        sections: section,
      });
    }

    this._days = days;
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