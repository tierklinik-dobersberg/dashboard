import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { combineLatest, map } from 'rxjs/operators';
import { CreateRostaScheduleComponent, CreateRostaScheduleConfig } from 'src/app/dialogs/create-rosta-schedule/create-rosta-schedule.component';
import { OpeningHoursService, Time } from 'src/app/openinghours.service';
import { RostaService } from 'src/app/rosta.service';
import { User, UsersService } from 'src/app/users.service';
import { CalendarDay, CalendarSource, CalendarViewer, DateSpan, Schedule, TdCalendarClickEvent, TdCalendarComponent } from '../calendar';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

interface DateSchedule {
  schedule: Schedule<any>;
  date: Date;
}

interface UserWithHours extends User {
  hours: number;
}

export class RostaSource implements CalendarSource {
  constructor(private _service: OpeningHoursService,
              private _reload: Observable<void>,
              private _schedules: (span: DateSpan) => Observable<DateSchedule[]>) {}
  
  connect(viewer: CalendarViewer): Observable<CalendarDay[]> {
    return new Observable(observer => {
      const sub = viewer.viewChange
        .pipe(combineLatest(this._reload))
        .subscribe(([span]) => {
          this._service.getConfig()
          .pipe(
            combineLatest(this._schedules(span)),
            map(([config, schedules]) => {
              let result: CalendarDay[] = [];
              
              for (let i = 0; i < 7; i++) {
                const offsetDays = i; 
                const date = moment(span.startDate).clone().add(offsetDays, 'days');
                const weekDay = this._service.getKeyFromDay(i + 1);
                
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
  
  disconnect(viewer: CalendarViewer) {}
}

let _nextUniqueId = 100;


@Component({
  selector: 'cl-rosta',
  templateUrl: './rosta.component.html',
  styleUrls: ['./rosta.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({transform: 'scaleX(0)', width: '0px', 'min-width': '0px'}),
        animate('300ms ease-in-out', style({transform: 'scaleX(1)', width: '*', 'min-width': '*'}))
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({transform: 'scaleX(0)', width: '0px', 'min-width': '0px'}))
      ]),
    ]),
  ]
})
export class RostaComponent implements OnInit, AfterViewInit {
  calendarSource: RostaSource;

  _lastClickEvent: TdCalendarClickEvent | null = null;

  @ViewChild('editOrNewMenu', {read: TemplateRef})
  _editOrNewMenu: TemplateRef<any>;

  @ViewChild('calendar', {read: TdCalendarComponent})
  _calendar: TdCalendarComponent;

  @Input()
  set readonly(v: any) {
    this._readonly = coerceBooleanProperty(v);
  }
  get readonly() {
    return this._readonly;
  }
  private _readonly: boolean = true;
  
  _highlightedUser: string | null = null;
  _selecetedUser: string | null = null;

  _showSideBar = false;

  private _reload: BehaviorSubject<void> = new BehaviorSubject(null);
  private _schedules: DateSchedule[] = [];
  
  _users: UserWithHours[] = [];

  constructor(private _openingHourService: OpeningHoursService,
              private _userService: UsersService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _rostaService: RostaService,
              private _dialog: MatDialog) { }

  ngOnInit() {
    const load = (span: DateSpan) => {
      return this._rostaService.getRemoteSchedules(span.startDate.getTime(), span.endDate.getTime())
        .pipe(
          map(rostas => {
            let schedules: DateSchedule[] = [];

            rostas.forEach(rosta => {
              rosta.schedules.forEach(schedule => {
                schedules.push({
                  date: moment(rosta.startDate).add(schedule.weekDay - 1, 'days').toDate(),
                  schedule: {
                    attendees: (schedule.users || []).map(user => ({
                      name: user.username,
                      data: user,
                      icon: user.icon,
                    })),
                    start: new Time(schedule.start),
                    end: new Time(schedule.end),
                    id: schedule.id,
                    type: schedule.type
                  },
                })
              })
            });
            this._schedules = schedules;
            
            this._updateUsers();
            this._changeDetectorRef.markForCheck();

            return schedules;
          })
        )
    }
    
    this.calendarSource = new RostaSource(this._openingHourService, this._reload, load);
      
    this._userService.listUsers()
      .subscribe(users => {
        this._users = users.filter(user => user.type !== 'other').map(user => {
          return {
            ...user,
            hours: 0,
          }
        });
      });
  }

  ngAfterViewInit() {
  }
  
  _trackUser(_: number, user: User) {
    return user.username;
  }
  
  _toggleSideBar() {
    this._showSideBar = !this._showSideBar;
    
    // If we hide the side bar make sure to clear any
    // user filters because this can be confusing
    if (!this._showSideBar) {
      this._highlightedUser = null;
      this._selecetedUser = null;
    }
  }

  _toggleSelectedUser(user: User) {
    if (this._selecetedUser === user.username) {
      this._selecetedUser = null;
    } else {
      this._selecetedUser = user.username;
    }
  }

  _highlightUser(user: UserWithHours|null) {
    if (!user) {
      this._highlightedUser = null;
    } else {
      // If there's already a user selected we skip the mouseenter event
      if (this._selecetedUser !== null) {
        return;
      }
      this._highlightedUser = user.username;
    }
  }

  _shouldBeGray(schedule: Schedule<any>) {
    if (this._selecetedUser !== null) {
      return false;
    }
    
    if (this._highlightedUser === null) {
      return false;
    }
    
    return !schedule.attendees.some(at => at.name === this._highlightedUser);
  }
  
  _containsSelectedUser(schedule: Schedule<any>) {
    if (this._selecetedUser === null) {
      return false;
    }
    
    return !schedule.attendees.some(at => at.name === this._selecetedUser);
  }

  _realignCalendar() {
    this._calendar.realign();
  }
  
  _editSchedule() {
    this._createSchedule(this._lastClickEvent, true);
  }
  
  _createNew() {
    this._lastClickEvent.schedule = undefined;
    this._createSchedule(this._lastClickEvent);
  }

  _deleteSchedule() {
    //let idx = last.findIndex(l => l.schedule.id === this._lastClickEvent.schedule.id);
    this._rostaService.deleteSchedule(this._lastClickEvent.schedule.id)
      .subscribe(() => {
        this._reload.next(null);
      });
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
    
    let isEventBetween = (d: Date, s: Schedule<any>) => {
      const start = moment(d).startOf('day').add(s.start.totalMinutes, 'minutes');
      const end = moment(d).startOf('day').add(s.end.totalMinutes, 'minutes');
      const date = moment(event.date);
      
      if (date >= start && date <= end) {
        return true;
      }
      
      if (!!event.end) {
        return moment(event.end) >= start && moment(event.end) <= end;
      }
      
      return false;
    }

    this._userService.listUsers()
      .subscribe(users => {
        const config: CreateRostaScheduleConfig = {
            date: event.date,
            end: event.end,
            schedule: event.schedule,
            disallowedUsers: this._schedules
              .filter(schedule => moment(event.date).format('dd.mm.YYYY') === moment(schedule.date).format('dd.mm.YYYY'))
              .filter(schedule => !event.schedule || schedule.schedule.id !== event.schedule.id)
              .filter(schedule => isEventBetween(schedule.date, schedule.schedule))
              .reduce<string[]>((users: string[], sched: DateSchedule) => {
                sched.schedule.attendees.forEach(attendee => {
                  if (!users.includes(attendee.name)) {
                    console.log(`Adding user ${attendee.name} from schedule ${sched.schedule.start}-${sched.schedule.end}`);
                    users.push(attendee.name);
                  }
                });

                return users;
              }, []),
        }
        this._dialog.open(CreateRostaScheduleComponent, {
          data: config
        }).afterClosed()
          .subscribe((result?: Schedule<any>&{date: Date}) => {
            if (!result) {
              return;
            }

            if (edit) {
              this._rostaService.editSchedule(result.date, result)
                .subscribe(res => {
                  this._reload.next(null);
                });
            } else {
              this._rostaService.createSchedule(result.date, result)
                .subscribe(res => {
                  this._reload.next(null);
                });
            }
          });
      });
  }

  private _updateUsers() {
    this._users = this._users.map(user => {
      let hours = 0;

      this._schedules.forEach(sched => {
        if (!(moment(sched.date).isSameOrAfter(this._calendar.currentDateSpan.startDate) && moment(sched.date).isSameOrBefore(this._calendar.currentDateSpan.endDate))) {
          return;
        }
        
        if (sched.schedule.attendees.find(at => at.name === user.username)) {
          hours += (sched.schedule.end.totalMinutes - sched.schedule.start.totalMinutes) / 60;
        }
      })

      return {
        ...user,
        hours: hours,
      }
    });
  }
}
