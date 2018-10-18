import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Time, OpeningHoursService, OpeningHoursConfig, WeekDay, TimeFrame } from 'src/app/openinghours.service';
import { OpeningHourDirective } from './opening-hour.directive';

export interface Day {
  date: moment.Moment;
  name: string;
  weekDayNumber: number;
  weekDay: WeekDay;
}

@Component({
  selector: 'cl-rosta-edit',
  templateUrl: './rosta.component.html',
  styleUrls: ['./rosta.component.scss']
})
export class RostaComponent implements OnInit, AfterViewInit {
  private _todaysWeek: number;
  private _todaysYear: number;
  
  _currentWeek: number;
  _currentYear: number;
  _currentMonth: string;
  _earliestStart: number = -1;
  _latestEnd: number = -1;
  
  @ViewChildren('weekDayContainer', {read: ElementRef})
  _calendarContainer: QueryList<ElementRef>;

  @ViewChildren(OpeningHourDirective)
  _openingHourDirectives: QueryList<OpeningHourDirective>;

  _openingHours: OpeningHoursConfig = {};
  
  _days: Day[] = [];
  
  constructor(private _openingService: OpeningHoursService) {
    let today = getWeekNumber(new Date());
    this._todaysWeek = today[1];
    this._todaysYear = today[0];
    this._currentMonth = this._getMonthName(new Date());
    
    this._currentWeek = this._todaysWeek;
    this._currentYear = this._todaysYear;
  }

  ngOnInit() {
    this._generateDays(new Date());
    this._loadOpeningHours();
  }

  ngAfterViewInit() {
    this._openingHourDirectives.changes
      .subscribe(() => {
        if (Object.keys(this._openingHours).length === 0) {
          return;
        }
        
        this._realignOpeningHours();
      });
  }

  _trackDays(_: number, day: Day) {
    return day.weekDayNumber;
  }
  
  _trackFrame(_: number, frame: TimeFrame) {
    return frame.start.totalMinutes;
  }

  private _realignOpeningHours() {
    this._openingHourDirectives.forEach((directive, index) => {
      let id = directive.weekdayNumber - 1;
      if (id < 0) { id = 6; }
      
      const minutesPerDay = this._latestEnd - this._earliestStart;
      
      console.log(`Minutes per day: ${minutesPerDay} (${new Time(minutesPerDay)}) (from ${this._earliestStart} to ${this._latestEnd})`);
      
      const container = this._calendarContainer.toArray()[id];
      const height = container.nativeElement.clientHeight;
      const duration = directive.frame.end.totalMinutes - directive.frame.start.totalMinutes;
      const startTime = directive.frame.start.totalMinutes - this._earliestStart;
      let pixelPerMinute = height / minutesPerDay;
      
      const hourTop = pixelPerMinute * startTime;
      const hourHeight = pixelPerMinute * duration;
      
      directive.elementRef.nativeElement.style.top = hourTop + 'px';
      directive.elementRef.nativeElement.style.height = hourHeight + 'px';
    });
  }

  private _getMonthName(date: Date) {
    let monthNames = [
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
    
    let m = moment(date);

    let current = monthNames[m.month()];
    m.endOf('week');
    let end = monthNames[m.month()];
    
    if (current !== end) {
      return `${current} - ${end}`;
    }
    
    return current;
  }

  private _loadOpeningHours() {
    this._openingService.getConfig()
      .subscribe(config => {
        console.log(`Opening hours `, config);
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
          
          if (this._latestEnd < 24*60 - 30) {
            this._latestEnd += 30;
          }

          if (!!this._calendarContainer) {
            this._realignOpeningHours();
          }
      });
  }
  
  private _generateDays(d: Date|moment.Moment) {
    if (moment.isDate(d)) {
      d = moment(d);
    }
    
    d.hours(0)
      .minutes(0)
      .seconds(0)
      .milliseconds(0)
      .weekday(0);
      
    let days: Day[] = [];
    let names = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

    for(let i = 0; i < 7; i++) {
      const weekDay = (i + 1) % 7;
      const name = names[i];
      const date = d.clone()
                    .weekday(weekDay);

      days.push({
        date: date,
        name: name,
        weekDayNumber: weekDay,
        weekDay: this._openingService.getKeyFromDay(weekDay),
      });
    }

    this._days = days;
  }
}

function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  // Return array of year and week number
  return [d.getUTCFullYear(), weekNo];
}