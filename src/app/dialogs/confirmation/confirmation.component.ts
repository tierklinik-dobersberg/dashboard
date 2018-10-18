import { Inject, Component, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'cl-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  title: string;
  message: string;

  constructor(@Inject(MAT_DIALOG_DATA) private _data: {title: string, message: string},
              private _dialogRef: MatDialogRef<ConfirmationComponent>) { }

  ngOnInit() {
    this.title = this._data.title;
    this.message = this._data.message;
  }
  
  _cancel() {
    this._dialogRef.close(false);
  }
  
  _save() {
    this._dialogRef.close(true);
  }

}
