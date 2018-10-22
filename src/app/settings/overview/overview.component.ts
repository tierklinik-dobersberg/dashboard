import {TemplateRef, Component, OnInit, ViewChild} from '@angular/core';
import {CalendarSource, CalendarViewer, CalendarDay, TdCalendarClickEvent, Schedule} from '../../components/calendar';
import {OpeningHoursService, Time} from '../../openinghours.service';
import {UsersService, User} from '../../users.service';
import {Observable, BehaviorSubject} from 'rxjs';
import {MatDialog, DialogPosition} from '@angular/material/dialog';
import {map, take, combineLatest} from 'rxjs/operators'
import * as moment from 'moment';
import { CreateRostaScheduleComponent } from '../../dialogs/create-rosta-schedule/create-rosta-schedule.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

interface DateSchedule {
  schedule: Schedule<any>;
  date: Date;
}

export class RostaSource implements CalendarSource {
  constructor(private _service: OpeningHoursService,
              private _schedules: Observable<DateSchedule[]>) {}
  
  connect(viewer: CalendarViewer): Observable<CalendarDay[]> {
    console.log(`Viewer ${Object.getPrototypeOf(viewer).constructor.name} connected`);
    return new Observable(observer => {
      const sub = viewer.viewChange
        .subscribe(span => {
          this._service.getConfig()
          .pipe(
            combineLatest(this._schedules),
            map(([config, schedules]) => {
              let result: CalendarDay[] = [];
              
              for (let i = 0; i < 7; i++) {
                const offsetDays = i + 1;
                const date = moment(span.startDate).clone().add(offsetDays, 'days');
                const weekDay = this._service.getKeyFromDay(offsetDays % 7);
                
                result.push({
                  date: date.toDate(),
                  name: weekDay,
                  sections: config[weekDay],
                  schedules: schedules.filter(sched => {
                    let momentSched = moment(sched.date);
                    let now = date.clone();

                    return momentSched.date() === now.date() &&
                           momentSched.month() === now.month() &&
                           momentSched.year() === now.year();
                  }).map(sched => sched.schedule)
                });
              }
    
              return result;
            })
          )
          .subscribe(result => observer.next(result));
        });
        
      return () => {
        sub.unsubscribe();
      }
    });
  }
  
  disconnect(viewer: CalendarViewer) {
    console.log(`Viewer ${Object.getPrototypeOf(viewer).constructor.name} disconnected`);
  }
}

let _nextUniqueId = 100;

@Component({
  selector: 'cl-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class SettingsOverviewComponent implements OnInit {
  calendarSource: RostaSource;

  _lastClickEvent: TdCalendarClickEvent | null = null;

  @ViewChild('editOrNewMenu', {read: TemplateRef})
  _editOrNewMenu: TemplateRef<any>;

  private _isHandset: boolean = false;
  private _schedules: BehaviorSubject<DateSchedule[]> = new BehaviorSubject([]);
  
  _users: User[] = [];

  constructor(private _openingHourService: OpeningHoursService,
              private _userService: UsersService,
              private _breakPointObserver: BreakpointObserver,
              private _dialog: MatDialog) { }

  ngOnInit() {
    this.calendarSource = new RostaSource(this._openingHourService, this._schedules);
    
    this._breakPointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this._isHandset = result.matches;
      });
  }
  
  _scrollTo(offset: number) {
    console.log(`scrolling to ${offset}`);
  }
  
  _trackUser(_: number, user: User) {
    return user.username;
  }
  
  _editSchedule() {
    this._createSchedule(this._lastClickEvent, true);
  }
  
  _createNew() {
    this._lastClickEvent.schedule = undefined;
    this._createSchedule(this._lastClickEvent);
  }

  _deleteSchedule() {
    let last = [...this._schedules.getValue()];
    let idx = last.findIndex(l => l.schedule.id === this._lastClickEvent.schedule.id);
    if (idx > -1) {
      last.splice(idx, 1);
    }
    
    this._schedules.next(last);
  }

  _createSchedule(event: TdCalendarClickEvent, edit = false) {
    if (!!event.schedule && !edit) {
      this._lastClickEvent = event;
      this._dialog.open(this._editOrNewMenu, {
        position: {
          top: event.position.y + 'px',
          left: event.position.x + 'px'
        },
      })
        .afterClosed()
        .subscribe(() => {
          this._lastClickEvent = null;
        });
      return;
    }

    this._userService.listUsers()
      .subscribe(users => {
        this._users = users;
        this._dialog.open(CreateRostaScheduleComponent, {
          data: {
            date: event.date,
            schedule: event.schedule,
          },
        }).afterClosed()
          .subscribe(result => {
            if (!result) {
              return;
            }
            
            let lastSchedules = [...this._schedules.getValue()];

            if (result.id !== null) {
              let idx = lastSchedules.findIndex(sched => sched.schedule.id === result.id);
              if (idx > -1) {
                lastSchedules.splice(idx, 1);
              } 
            } else {
              result.id = `${_nextUniqueId++}`;
            }
            
            lastSchedules.push({
              schedule: result,
              date: result.date,
            });
            
            this._schedules.next(lastSchedules);
          });
      });
  }
}
