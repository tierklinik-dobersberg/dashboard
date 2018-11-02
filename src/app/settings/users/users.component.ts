import { Component, OnInit } from '@angular/core';
import { UsersService, User } from 'src/app/users.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { MatCheckboxChange } from '@angular/material/checkbox';


@Component({
  selector: 'cl-user-settings',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  _users: User[] = [];

  _handset = false;

  constructor(private _userService: UsersService,
              private _dialog: MatDialog) { }

  ngOnInit() {
    this._loadUsers();
  }

  
  private _loadUsers(): void {
    this._userService.listUsers()
      .subscribe(users => {
        console.log(`Got users`, users)
        this._users = users;
      });
  }

  _trackUser(_: number, user: User) {
    return user.username;
  }

  _toggleUser(user: User, event: MatCheckboxChange) {
    user.enabled = event.checked;
    this._userService.updateUser(user.username, user.role, user.type, user.hoursPerWeek, user.icon, event.checked)
      .subscribe();
  }

  _createUser() {
    this._dialog.open(CreateUserDialogComponent)
      .afterClosed()
      .subscribe((res: (User&{password: string})|undefined) => {
        if (!res) {
          return;
        }
        
        this._userService.createUser(
          res.username,
          res.role,
          res.type,
          res.hoursPerWeek,
          res.password,
          res.icon,
          res.enabled,
          res.firstname,
          res.lastname,
          res.phoneNumber,
          res.mailAddress,
          res.mustChangePassword)
          .subscribe(() => this._loadUsers());
      });
  }

  _editUser(user: User) {
    this._dialog.open(CreateUserDialogComponent, {data: user})
      .afterClosed()
      .subscribe((res: (User&{password: string})|undefined) => {
        if (!res) {
          return;
        }
        
        this._userService.updateUser(
          res.username,
          res.role,
          res.type,
          res.hoursPerWeek,
          res.icon,
          res.enabled,
          res.firstname,
          res.lastname,
          res.phoneNumber,
          res.mailAddress,
          res.mustChangePassword)
          .subscribe(() => this._loadUsers());
      });
  }
  
  _deleteUser(user: User) {
    this._dialog.open(ConfirmationComponent, {
      data: {
        title: `Benutzer ${user.username} löschen`,
        message: 'Soll der Benutzer wirklich gelöscht werden?'
      }
    }).afterClosed()
      .subscribe(res => {
        if (!res) {
          return;
        }
        
        if (!!res) {
          this._userService.deleteUser(user.username)
            .subscribe(() => this._loadUsers());
        }
      })
  }
}
