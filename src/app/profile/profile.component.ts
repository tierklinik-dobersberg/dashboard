import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LoginService } from '../login.service';
import { User, UsersService } from '../users.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserDialogComponent } from '../settings/users/create-user-dialog/create-user-dialog.component';
import { ChangePasswordDialogComponent } from '../dialogs/change-password-dialog/change-password-dialog.component';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'cl-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {
  private _userSubscription: Subscription = Subscription.EMPTY;

  _user: User;
  _calendarName: string;
  
  constructor(private _loginService: LoginService,
              private _userService: UsersService,
              private _dialog: MatDialog,
              private _calendarService: CalendarService,
              private _changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this._userSubscription = this._loginService.user.subscribe(user => {
      this._user = user;
      
      if (!!user && !!user.googleCalendarID) {
        this._calendarService.listCalendars()
          .subscribe(list => {
            const cal = list.find(cal => cal.id === user.googleCalendarID);
            
            if (!cal) {
              return;
            }
            
            this._calendarName = cal.name;
            this._changeDetectorRef.markForCheck();
          }, err => {});
      }

      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    if (!!this._userSubscription) {
      this._userSubscription.unsubscribe();
      this._userSubscription = null
    }
  }
  
  _editUser() {
    this._dialog.open(CreateUserDialogComponent, {
      data: this._user
    })
    .afterClosed()
    .subscribe((result: User) => {
      if (!result) {
        return;
      }
      
      this._userService.updateUser(
        result.username,
        result.role,
        result.type,
        result.hoursPerWeek,
        result.icon,
        result.enabled,
        result.firstname,
        result.lastname,
        result.phoneNumber,
        result.mailAddress,
        result.googleCalendarID
      ).subscribe();
    })
  }

  _changePassword() {
    this._dialog.open(ChangePasswordDialogComponent, {data: this._user.username});
  }
}
