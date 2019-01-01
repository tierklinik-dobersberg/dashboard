import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { combineLatest, map } from 'rxjs/operators';
import { CreateRosterScheduleComponent, CreateRosterScheduleConfig } from 'src/app/dialogs/create-roster-schedule/create-roster-schedule.component';
import { OpeningHoursService, Time } from 'src/app/openinghours.service';
import { RosterService, RosterScheduleType } from 'src/app/roster.service';
import { User, UsersService } from 'src/app/users.service';
import { CalendarDay, CalendarSource, CalendarViewer, DateSpan, Schedule, TdCalendarClickEvent, TdCalendarComponent } from '../calendar';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { HypnoloadService } from '../hypnoload/hypnoload.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { CalendarService, CalendarEvent } from 'src/app/calendar.service';

interface DateSchedule {
  schedule: Schedule<any>;
  date: Date;
}

interface UserWithHours extends User {
  hours: {
    total: number;
    perType: {type: RosterScheduleType, hours: number}[],
  };
}

export class RosterSource implements CalendarSource {
  constructor(private _service: OpeningHoursService,
              private _reload: Observable<void>,
              private _loader: HypnoloadService,
              private _snackbar: MatSnackBar,
              private _schedules: (span: DateSpan) => Observable<DateSchedule[]>) {}
  
  connect(viewer: CalendarViewer): Observable<CalendarDay[]> {
    return new Observable(observer => {
      const sub = viewer.viewChange
        .pipe(combineLatest(this._reload))
        .subscribe(([span]) => {
          
          this._loader.show();

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
    
              // make sure we show the loader at least for ~250ms
              // to prevent flickering if the response was that quick
              setTimeout(() => this._loader.hide(), 250);
              
              return result;
            })
          )
          .subscribe(result => {
            observer.next(result)
          }, err => {
            if (!(err instanceof HttpErrorResponse)) {
              this._snackbar.open(`Error: ${err.message || err.statusText || err.status}`, 'OK');
            }
            this._loader.hide();
          });
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
  selector: 'cl-roster',
  templateUrl: './roster.component.html',
  styleUrls: ['./roster.component.scss'],
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
export class RosterComponent implements OnInit, OnDestroy, AfterViewInit {
  calendarSource: RosterSource;

  _lastClickEvent: TdCalendarClickEvent | null = null;

  private _mediaQuery: MediaQueryList | null = null;
  private _mediaListener: () => void | null = null;

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

  @Input()
  set sideNavOpen(v: any) {
    this._sideNavOpen = coerceBooleanProperty(v);
  }
  get sideNavOpen() {
    return this._sideNavOpen;
  }
  private _sideNavOpen: boolean = true;
  
  _highlightedUser: string | null = null;
  _selecetedUser: string | null = null;
  _types: RosterScheduleType[] = [];
  _showSideBar = false;
  _filteredType: 'all'|number = 'all';

  private _reload: BehaviorSubject<void> = new BehaviorSubject(null);
  private _schedules: DateSchedule[] = [];
  
  _users: UserWithHours[] = [];

  _holidays: Map<number, string> = new Map();;

  constructor(private _openingHourService: OpeningHoursService,
              private _userService: UsersService,
              private _loader: HypnoloadService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _rosterService: RosterService,
              private _mediaMatcher: MediaMatcher,
              private _snackbar: MatSnackBar,
              private _calendarService: CalendarService,
              private _dialog: MatDialog) { }

  ngOnDestroy() {
    this._mediaQuery.removeListener(this._mediaListener);
  }
  
  _getHoliday(date: moment.Moment): string | null {
    return this._holidays.get(date.valueOf()) || null;
  }

  ngOnInit() {
    this._mediaQuery = this._mediaMatcher.matchMedia('(max-width: 600px)');

    this._mediaListener = () => {
      if (this._mediaQuery.matches) {
        this._sideNavOpen = false;
        console.log(`Closing sidebar on handset`);
      }
      this._changeDetectorRef.detectChanges();
    };

    this._mediaQuery.addListener(this._mediaListener);

    if (this._mediaQuery.matches) {
      this._showSideBar = false;
      this.sideNavOpen = false;
    }

    const load = (span: DateSpan) => {
      this._calendarService.listEvents(['intern:holidays'])
        .subscribe(events => {
          this._holidays.clear();
          
          events.forEach(day => {
            this._holidays.set(day.start.valueOf(), day.id);
          })

          this._changeDetectorRef.markForCheck();
        });
        
      return this._rosterService.getRemoteSchedules(span.startDate.getTime(), span.endDate.getTime())
        .pipe(
          map(rosters => {
            let schedules: DateSchedule[] = [];

            rosters.forEach(roster => {
              roster.schedules.forEach(schedule => {
                
                schedules.push({
                  date: moment(roster.startDate).add(schedule.weekDay - 1, 'days').toDate(),
                  schedule: {
                    attendees: (schedule.users || []).map(user => {
                      const u = this._users.find(u => u.username === user.username);
                      if (!u) {
                        console.warn(`Failed to find user cached user object for username ${user.username}`)
                      }
                      return {
                        name: user.username,
                        data: {
                          ...user,
                          icon: !!u ? u.icon : null,
                        }
                      };
                    }),
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
    
    this.calendarSource = new RosterSource(this._openingHourService, this._reload, this._loader,  this._snackbar, load);
      
    this._rosterService.getTypes()
      .subscribe(types => this._types = types);
    
    this._userService.listUsers()
      .subscribe(users => {
        this._users = users.filter(user => user.type !== 'other').map(user => {
          return {
            ...user,
            hours: {
              total: 0,
              perType: []
            },
          }
        });
      });
  }

  ngAfterViewInit() {
  }
  
  _filterType(type: number|'all') {
    console.log(`filtering by ${type}`);
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
  
  _containsSelectedUserOrType(schedule: Schedule<any>) {
    if (schedule.type.id !== this._filteredType && this._filteredType !== 'all') {
      return false;
    }
    
    if (this._selecetedUser === null) {
      return true;
    }
    
    return schedule.attendees.some(at => at.name === this._selecetedUser);
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
    this._rosterService.deleteSchedule(this._lastClickEvent.schedule.id)
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
        const config: CreateRosterScheduleConfig = {
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
        this._dialog.open(CreateRosterScheduleComponent, {
          data: config
        }).afterClosed()
          .subscribe((result?: Schedule<any>&{date: Date}) => {
            if (!result) {
              return;
            }

            if (edit) {
              this._rosterService.editSchedule(result.date, result)
                .subscribe(res => {
                  this._reload.next(null);
                });
            } else {
              this._rosterService.createSchedule(result.date, result)
                .subscribe(res => {
                  this._reload.next(null);
                });
            }
          });
      });
  }

  private _updateUsers() {
    this._users = this._users.map(user => {
      let total = 0;
      let perType: UserWithHours['hours']['perType'] = [];


      this._schedules.forEach(sched => {
        if (!(moment(sched.date).isSameOrAfter(this._calendar.currentDateSpan.startDate) && moment(sched.date).isSameOrBefore(this._calendar.currentDateSpan.endDate))) {
          return;
        }
        
        if (!perType.find(p => p.type.id === sched.schedule.type.id)) {
          perType.push({
            type: sched.schedule.type,
            hours: 0
          });
        }
        
        perType.find(p => p.type.id === sched.schedule.type.id)!.hours++;
        
        if (sched.schedule.attendees.find(at => at.name === user.username)) {
          total += (sched.schedule.end.totalMinutes - sched.schedule.start.totalMinutes) / 60;
        }
      })

      return {
        ...user,
        hours: {
          total,
          perType
        }
      }
    });
  }
}
