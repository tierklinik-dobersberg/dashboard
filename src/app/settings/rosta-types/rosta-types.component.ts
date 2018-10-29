import { Component, OnInit } from '@angular/core';
import { RostaScheduleType, RostaService } from 'src/app/rosta.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RostaTypeDialogComponent } from 'src/app/dialogs/rosta-type-dialog/rosta-type-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'cl-rosta-types',
  templateUrl: './rosta-types.component.html',
  styleUrls: ['./rosta-types.component.scss']
})
export class RostaTypesComponent implements OnInit {
  _types: RostaScheduleType[];

  constructor(private _rostaService: RostaService,
              private _dialog: MatDialog,
              private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this._loadTypes();
  }
  
  private _loadTypes() {
    this._rostaService.getTypes()
      .subscribe(types => this._types = types);
  }
  
  _trackType(_: number, type: RostaScheduleType) {
    return type.id;
  }

  _deleteType(type: RostaScheduleType) {
    if (this._types.length === 1) {
      this._snackBar.open('Die letzte Dienstart kann nicht gelöscht werden', undefined, {duration: 2000});
      return;
    }
    
    this._rostaService.deleteType(type.id)
      .subscribe(() => this._loadTypes());
  }
  
  _createType() {
    this._dialog.open(RostaTypeDialogComponent)
      .afterClosed()
      .subscribe(result => {
        if (!result) {
          return;
        }
        
        this._rostaService.createType(result.name, result.color)
          .subscribe(() => this._loadTypes());
      })
  }
}
