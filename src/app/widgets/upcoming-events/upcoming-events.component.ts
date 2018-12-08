import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import * as moment from 'moment';
import { interval, Subscription, BehaviorSubject } from 'rxjs';
import { flatMap, startWith, combineLatest } from 'rxjs/operators';
import { CalendarEvent, CalendarListEntry, CalendarService } from 'src/app/calendar.service';
import { User, UsersService } from 'src/app/users.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateCalendarEventComponent } from 'src/app/dialogs/create-calendar-event/create-calendar-event.component';

@Component({
  selector: 'cl-upcoming-events',
  templateUrl: './upcoming-events.component.html',
  styleUrls: ['./upcoming-events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingEventsComponent implements OnInit {
  private _sub: Subscription;
  _calendards: Map<string, CalendarListEntry> = new Map();
  _users: Map<string, User> = new Map();
  _events: CalendarEvent[] = [];
  _reload: BehaviorSubject<null> = new BehaviorSubject(null);

  constructor(private _calService: CalendarService,
              private _userService: UsersService,
              private _dialog: MatDialog,
              private _changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this._userService.listUsers()
      .subscribe(users => {
        users.forEach(user => {
          if (!user.googleCalendarID) {
            return;
          }
          
          this._users.set(user.googleCalendarID, user);
          this._changeDetector.markForCheck();
        });
      });

    this._calService.listCalendars()
      .subscribe(calendars => {
        calendars.forEach(cal => {
          this._calendards.set(cal.id, cal);
        })

        this._sub = interval(20000)
          .pipe(
            startWith(-1),
            combineLatest(this._reload),
            flatMap(() => {
              let ids: string[] = [];
              this._calendards.forEach(value => ids.push(value.id));
              return this._calService.listEvents(ids, moment().toDate(), moment().endOf('day').toDate());
            }),
          )
          .subscribe(list => {
            this._events = list.sort((a, b) => a.start.unix() - b.start.unix());
            this._changeDetector.markForCheck();
          });
      });
  }
  
  ngOnDestroy() {
    if (!!this._sub) {
      this._sub.unsubscribe();
    }
  }

  _createEvent() {
    this._dialog.open(CreateCalendarEventComponent)
      .afterClosed()
      .subscribe(res => {
        if (!!res) {
          this._calService.createEvent(res.calendarId, res.title, res.description, res.from, res.to)
            .subscribe(() => this._reload.next(null));
        }
      });
  }
  
  _trackEvent(idx: number, event: CalendarEvent) {
    return event.id;
  }
}
