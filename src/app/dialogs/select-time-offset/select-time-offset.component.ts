import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'cl-select-time-offset',
  templateUrl: './select-time-offset.component.html',
  styleUrls: ['./select-time-offset.component.scss']
})
export class SelectTimeOffsetComponent implements OnInit {
  _duration: number = 30;

  constructor(private _dialogRef: MatDialogRef<SelectTimeOffsetComponent>) { }

  ngOnInit() {
  }

  _cancel() {
    this._dialogRef.close();
  }
  
  _save() {
    this._dialogRef.close(this._duration);
  }
}
