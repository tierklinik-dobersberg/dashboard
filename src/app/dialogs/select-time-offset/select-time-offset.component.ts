import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DoorState } from 'src/app/door.service';

@Component({
  selector: 'cl-select-time-offset',
  templateUrl: './select-time-offset.component.html',
  styleUrls: ['./select-time-offset.component.scss']
})
export class SelectTimeOffsetComponent implements OnInit {
  _duration: number = 30;

  get desiredState() {
    if (!this._desiredState) {
      return 'loading';
    }
    
    switch(this._desiredState) {
    case 'lock':
      return 'gesperrt'
    case 'unlock':
      return 'entsperrt';
    }
    
    return '';
  }

  constructor(private _dialogRef: MatDialogRef<SelectTimeOffsetComponent>,
              @Inject(MAT_DIALOG_DATA) private _desiredState: DoorState) { }

  ngOnInit() {
  }

  _cancel() {
    this._dialogRef.close();
  }
  
  _save() {
    this._dialogRef.close(this._duration);
  }
}
