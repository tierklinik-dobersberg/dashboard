import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Time } from '../../../openinghours.service';

@Component({
  selector: 'cl-time-frame-dialog',
  templateUrl: './time-frame-dialog.component.html',
  styleUrls: ['./time-frame-dialog.component.scss']
})
export class TimeFrameDialogComponent implements OnInit {
  _fromHour: number = 8;
  _fromMinute: number = 0;
  _toHour: number = 12;
  _toMinute: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public readonly weekday: string,
              private _dialogRef: MatDialogRef<TimeFrameDialogComponent>) { }

  ngOnInit() {
  }

  _abort() {
    this._dialogRef.close();
  }
  
  _save() {
    this._dialogRef.close({
      start: new Time(this._fromHour * 60 + this._fromMinute),
      end: new Time(this._toHour * 60 + this._toMinute)
    });
  }
}
