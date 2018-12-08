import { Component, OnInit, Inject, ChangeDetectorRef, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IntegrationService } from 'src/app/integration.service';
import { CalendarListEntry } from 'src/app/calendar.service';

@Component({
  selector: 'cl-create-calendar-dialog',
  templateUrl: './create-calendar-dialog.component.html',
  styleUrls: ['./create-calendar-dialog.component.scss']
})
export class CreateCalendarDialogComponent implements OnInit {
  _accountName: string = '';
  _accountId: string = '';
  _backgroundColor: string = '';
  _foregroundColor: string = '#000000';
  _name: string = '';

  constructor(private _dialogRef: MatDialogRef<CreateCalendarDialogComponent>,
              private _integrationService: IntegrationService,
              private _changeDetector: ChangeDetectorRef,
              @Optional() @Inject(MAT_DIALOG_DATA) private _calendarToEdit: CalendarListEntry) { }

  ngOnInit() {
    if (!!this._calendarToEdit) {
      this._name = this._calendarToEdit.name;
      this._foregroundColor = this._calendarToEdit.foregroundColor;
      this._backgroundColor = this._calendarToEdit.backgroundColor;
    }


    this._integrationService.getGoogleAuthStatus()
      .subscribe(res => {
        if (!res.authenticated) {
          return;
        }
        this._accountName = res.profile.name;
        this._accountId = res.profile.id;
        
        this._changeDetector.detectChanges();
      });
  }

  _save() {
    this._dialogRef.close({
      name: this._name,
      backgroundColor: this._backgroundColor,
      foregroundColor: this._foregroundColor,
      accountId: this._accountId
    });
  }
}
