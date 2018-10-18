import { Optional, Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserType, User } from 'src/app/users.service';

@Component({
  selector: 'cl-create-user-dialog',
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss']
})
export class CreateUserDialogComponent implements OnInit {
  _username: string;
  _password: string;
  _type: UserType;
  _isAdmin: boolean = false;
  _hoursPerWeek: number;

  constructor(private _dialogRef: MatDialogRef<CreateUserDialogComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public _userToEdit?: User) { }

  ngOnInit() {
    if (!!this._userToEdit) {
      this._username = this._userToEdit.username;
      this._type = this._userToEdit.type;
      this._isAdmin = this._userToEdit.role === 'admin';
      this._hoursPerWeek = this._userToEdit.hoursPerWeek;
    }
  }

  _abort() {
    this._dialogRef.close();
  }
  
  _save() {
    let user: (User&{password: string}) = {
      username: this._username,
      password: this._password,
      enabled: true,
      role: this._isAdmin ? 'admin' : 'user',
      type: this._type,
      hoursPerWeek: this._hoursPerWeek,
    }
    this._dialogRef.close(user);
  }
}
