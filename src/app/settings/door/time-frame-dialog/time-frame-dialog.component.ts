import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
      from: [this._fromHour, this._fromMinute],
      to: [this._toHour, this._toMinute],
    });
  }
}
