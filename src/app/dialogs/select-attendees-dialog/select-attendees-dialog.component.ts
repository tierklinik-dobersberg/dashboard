import { Inject, Component, OnInit } from '@angular/core';
import { UsersService, User } from 'src/app/users.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface SelectableUser extends User {
  selected: boolean;
}

@Component({
  selector: 'cl-select-attendees-dialog',
  templateUrl: './select-attendees-dialog.component.html',
  styleUrls: ['./select-attendees-dialog.component.scss']
})
export class SelectAttendeesDialogComponent implements OnInit {
  _users: SelectableUser[] = [];
  
  constructor(private _userService: UsersService,
              @Inject(MAT_DIALOG_DATA) private _selectedUser: string[],
              private _dialogRef: MatDialogRef<SelectAttendeesDialogComponent>) { }

  ngOnInit() {
    this._userService.listUsers()
      .subscribe(users => this._users = users.map(user => ({
        ...user,
        selected: this._selectedUser.includes(user.username),
      })));
  }

  _trackUser(_: number, user: SelectableUser) {
    return user.username;
  }

  _toggleUser(user: SelectableUser, event: MatCheckboxChange) {
    user.selected = event.checked;
  }
  
  _save() {
    this._dialogRef.close(this._users.filter(user => !!user.selected));
  }
}
