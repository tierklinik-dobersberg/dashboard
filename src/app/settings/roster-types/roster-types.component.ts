import { Component, OnInit } from '@angular/core';
import { RosterScheduleType, RosterService } from 'src/app/roster.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RostaTypeDialogComponent } from 'src/app/dialogs/rosta-type-dialog/rosta-type-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'cl-roster-types',
  templateUrl: './roster-types.component.html',
  styleUrls: ['./roster-types.component.scss']
})
export class RosterTypesComponent implements OnInit {
  _types: RosterScheduleType[];

  constructor(private _rostaService: RosterService,
              private _dialog: MatDialog,
              private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this._loadTypes();
  }
  
  private _loadTypes() {
    this._rostaService.getTypes()
      .subscribe(types => this._types = types);
  }
  
  _trackType(_: number, type: RosterScheduleType) {
    return type.id;
  }

  _deleteType(type: RosterScheduleType) {
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
