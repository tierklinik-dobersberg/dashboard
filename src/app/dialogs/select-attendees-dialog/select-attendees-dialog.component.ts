import { Inject, Component, OnInit } from '@angular/core';
import { UsersService, User } from 'src/app/users.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface SelectableUser extends User {
  selected: boolean;
}

export interface SelectAttendeesConfiguration {
  /**
   * A list of users that cannot be added as attendees because
   * they are already part of an overlapping schedule
   */
  disallowedUsers: string[];

  /**
   * A list of already selected attendees for the schedule
   */
  selectedUsers: string[];
}

@Component({
  selector: 'cl-select-attendees-dialog',
  templateUrl: './select-attendees-dialog.component.html',
  styleUrls: ['./select-attendees-dialog.component.scss']
})
export class SelectAttendeesDialogComponent implements OnInit {
  _users: SelectableUser[] = [];
  
  constructor(private _userService: UsersService,
              @Inject(MAT_DIALOG_DATA) private _config: SelectAttendeesConfiguration,
              private _dialogRef: MatDialogRef<SelectAttendeesDialogComponent>) { }

  ngOnInit() {
    this._userService.listUsers()
      .subscribe(users => this._users = users
        .filter(user => user.type !== 'other')
        .filter(user => !this._config.disallowedUsers.includes(user.username))
        .map(user => ({
          ...user,
          selected: this._config.selectedUsers.includes(user.username),
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
