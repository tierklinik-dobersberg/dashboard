import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './rosta-type-dialog.component.html',
  styleUrls: ['./rosta-type-dialog.component.scss']
})
export class RostaTypeDialogComponent implements OnInit {
  _name: string;
  _color: string;

  constructor(private _dialogRef: MatDialogRef<RostaTypeDialogComponent>) { }

  ngOnInit() {
  }

  _save() {
    this._dialogRef.close({
      name: this._name,
      color: this._color,
    });
  }
}
