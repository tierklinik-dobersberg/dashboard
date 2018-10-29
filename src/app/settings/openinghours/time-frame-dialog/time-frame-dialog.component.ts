import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Time } from '../../../openinghours.service';

@Component({
  selector: 'cl-time-frame-dialog',
  templateUrl: './time-frame-dialog.component.html',
  styleUrls: ['./time-frame-dialog.component.scss']
})
export class TimeFrameDialogComponent implements OnInit {
  _from: string = '08:00';
  _to: string = '12:00';

  constructor(@Inject(MAT_DIALOG_DATA) public readonly weekday: string,
              private _dialogRef: MatDialogRef<TimeFrameDialogComponent>) { }

  ngOnInit() {
  }

  _abort() {
    this._dialogRef.close();
  }
  
  _save() {
    this._dialogRef.close({
      start: new Time(this._from),
      end: new Time(this._to)
    });
  }
}
