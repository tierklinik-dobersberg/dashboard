import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'cl-enter-name-dialog',
  templateUrl: './enter-name-dialog.component.html',
  styleUrls: ['./enter-name-dialog.component.scss']
})
export class EnterNameDialogComponent implements OnInit {
  _name: string;

  constructor(private _dialogRef: MatDialogRef<EnterNameDialogComponent>) { }

  ngOnInit() {
  }

  _save() {
    this._dialogRef.close(this._name);
  }
}
