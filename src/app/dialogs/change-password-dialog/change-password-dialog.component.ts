import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from 'src/app/users.service';

@Component({
  selector: 'cl-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit {
  _oldPassword: string;
  _newPassword: string;

  constructor(private _dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private _username: string,
              private _userService: UsersService,
              private _snackBar: MatSnackBar) { } 
  
  ngOnInit() {
  }
  
  _save() {
    this._userService.changePassword(this._username, this._oldPassword, this._newPassword)
          .subscribe(
            {
              next: () => {
                this._snackBar.open('Passwort erfolgreich gespeichert', 'OK', {duration: 2000});
                this._dialogRef.close();
              },
              error: () => this._snackBar.open('Password konnte nicht geändert werden', 'OK', {duration: 2000}),
            } 
          );
  }

}
