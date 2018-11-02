import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './roster-type-dialog.component.html',
  styleUrls: ['./roster-type-dialog.component.scss']
})
export class RosterTypeDialogComponent implements OnInit {
  _name: string;
  _color: string;

  constructor(private _dialogRef: MatDialogRef<RosterTypeDialogComponent>) { }

  ngOnInit() {
  }

  _save() {
    this._dialogRef.close({
      name: this._name,
      color: this._color,
    });
  }
}
