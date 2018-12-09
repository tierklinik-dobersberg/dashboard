import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { CalendarListEntry, CalendarService } from 'src/app/calendar.service';
import { Time } from 'src/app/openinghours.service';
import { RemoteRoster, RosterService } from 'src/app/roster.service';
import { User } from 'src/app/users.service';

@Component({
  selector: 'cl-create-calendar-event',
  templateUrl: './create-calendar-event.component.html',
  styleUrls: ['./create-calendar-event.component.scss']
})
export class CreateCalendarEventComponent implements OnInit {
  _title: string = '';
  _calendarId: string = '';
  _description: string = '';
  _from: string = '';
  _to: string = '';
  _date: string = (new Date()).toISOString();
  _noRoster: boolean = false;
  _showUsers: boolean = false;

  private _lastWeekLoaded: number = -1;
  private _schedules: RemoteRoster[] = [];
  private _allCalendars: CalendarListEntry[] = [];

  _usersAvailable: string[] = [];
  _calendars: CalendarListEntry[] = [];

  constructor(private _dialogRef: MatDialogRef<CreateCalendarEventComponent>,
              private _rosterService: RosterService,
              private _calendarService: CalendarService,
              private _changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this._calendarService.listCalendars()
      .subscribe(list => {
        this._allCalendars = list;
        this._calendars = [...this._allCalendars];
        this._getPossibleCalendars();        
      });
  }

  private _filterCalendars() {
    const schedules = this._schedules;
    const weekDay = moment(this._date).isoWeekday();
    const startTime = new Time(this._from);

    if (schedules.length === 0) {
      this._noRoster = true;
    } else {
      this._noRoster = true;
      const users: Set<User> = new Set();
      const calendars: Set<CalendarListEntry> = new Set();
      // TODO(ppacher): need to add the primary calendar

      schedules.forEach(roster => {
        roster.schedules.forEach(sched => {
          if (sched.weekDay != weekDay) {
            return;
          }
          
          if (startTime.totalMinutes < sched.start || startTime.totalMinutes > sched.end) {
            return;
          }
          
          this._noRoster = false;

          sched.users.forEach(user => {
            users.add(user);

            if (!!user.googleCalendarID) {
              const cal = this._allCalendars.find(c => c.id === user.googleCalendarID);
              
              if (!!cal) {
                calendars.add(cal);
              }
            }
          })
        });
      });

      this._usersAvailable = Array.from(users.values()).map(user => `${user.firstname} ${user.lastname}`);
      this._calendars = Array.from(calendars.values());
    }

    if (this._noRoster) {
      this._calendars = [...this._allCalendars];
    }
    
    // if the selected calender isn't valid any more, clear the calendarId
    if (!!this._calendarId && this._calendars.find(cal => cal.id === this._calendarId) == undefined) {
      this._calendarId = '';
    }

    this._changeDetector.markForCheck();
  }
  
  _getPossibleCalendars() {
    if (!this._to || !this._from) {
      return;
    }
    
    // If the current date is still within the loaded week
    // just filter the result
    const weekNumber = moment(this._date).isoWeek();
    if (weekNumber === this._lastWeekLoaded) {
      this._filterCalendars();
      return;
    }
    
    const start = moment(this._date).startOf('isoWeek');
    const end = moment(this._date).endOf('isoWeek');

    this._rosterService.getRemoteSchedules(start.valueOf(), end.valueOf())
      .subscribe(schedules => {
        console.log(`Got schedules for ${start.format()} - ${end.format()}: `, schedules)
        this._schedules = schedules;

        this._filterCalendars();
      });
  }

  _save() {
    this._dialogRef.close({
      title: this._title,
      calendarId: this._calendarId,
      description: this._description,
      from: moment(this._date).startOf('day').add(new Time(this._from).totalMinutes, 'minutes').toDate(),
      to: moment(this._date).startOf('day').add(new Time(this._to).totalMinutes, 'minutes').toDate(),
    });
  }
}
