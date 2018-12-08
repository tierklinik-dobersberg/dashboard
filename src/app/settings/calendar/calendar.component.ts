import { Component, OnInit } from '@angular/core';
import { IntegrationService } from 'src/app/integration.service';
import { CalendarService, CalendarListEntry } from 'src/app/calendar.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { CreateCalendarDialogComponent } from 'src/app/dialogs/create-calendar-dialog/create-calendar-dialog.component';

@Component({
  selector: 'cl-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  _enabled: boolean = false;
  _accountName: string = '';
  _calendars: CalendarListEntry[] = [];

  constructor(private _integrationService: IntegrationService,
              private _calendarService: CalendarService,
              private _dialog: MatDialog) { }

  ngOnInit() {
    this._integrationService.getGoogleAuthStatus()
      .subscribe(res => {
        this._enabled = res.authenticated;

        if (this._enabled) {
          this._loadCalendars();
          
          this._accountName = res.profile.name || '';
        }
      });
  }
  
  _trackCalendar(idx: number, cal: CalendarListEntry) {
    return cal.id;
  }

  _createNew() {
    this._dialog.open(CreateCalendarDialogComponent)
      .afterClosed()
      .subscribe(res => {
        if (!!res) {
          this._calendarService.createCalendar(res.name, res.backgroundColor, res.foregroundColor)
            .subscribe(() => this._loadCalendars());
        }
      });
  }

  _editCalendar(cal: CalendarListEntry) {
    this._dialog.open(CreateCalendarDialogComponent, {data: cal})
      .afterClosed()
      .subscribe(res => {
        if (!!res) {
          this._calendarService.updateCalendar(cal.id, res.name, res.backgroundColor, res.foregroundColor)
            .subscribe(() => this._loadCalendars());
        }
      });
  }
  
  _deleteCalendar(cal: CalendarListEntry) {
    this._dialog.open(ConfirmationComponent, {
      data: {
        title: cal.name,
        message: 'Soll der Kalender wirklich gelöscht werden? Alle Termine in diesem Kalender werden ebenfalls gelöscht.'
      }
    }).afterClosed()
      .subscribe(res => {
        if (!!res) {
          this._calendarService.deleteCalendar(cal.id)
            .subscribe(() => this._loadCalendars());
        }
      });
  }

  private _loadCalendars() {
    this._calendarService.listCalendars()
      .subscribe(list => this._calendars = list);
  }
}
