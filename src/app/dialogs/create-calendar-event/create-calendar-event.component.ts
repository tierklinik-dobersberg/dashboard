import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CalendarListEntry, CalendarService } from 'src/app/calendar.service';
import { Time } from 'src/app/openinghours.service';
import * as moment from 'moment';

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

  _calendars: CalendarListEntry[] = [];

  constructor(private _dialogRef: MatDialogRef<CreateCalendarEventComponent>,
              private _calendarService: CalendarService) { }

  ngOnInit() {
    this._calendarService.listCalendars()
      .subscribe(list => this._calendars = list);
  }

  _save() {
    this._dialogRef.close({
      title: this._title,
      calendarId: this._calendarId,
      description: this._description,
      from: moment().startOf('day').add(new Time(this._from).totalMinutes, 'minutes').toDate(),
      to: moment().startOf('day').add(new Time(this._to).totalMinutes, 'minutes').toDate(),
    });
  }
}
