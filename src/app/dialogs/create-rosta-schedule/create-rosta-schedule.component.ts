import { Component, OnInit, HostBinding, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SelectAttendeesDialogComponent } from '../select-attendees-dialog/select-attendees-dialog.component';
import { User, UsersService } from '../../users.service';
import * as moment from 'moment';
import { Schedule } from '../../components/calendar';
import { Time } from 'src/app/openinghours.service';

export interface CreateRostaScheduleConfig {
  date: Date;
  schedule?: Schedule<any>;
}

@Component({
  selector: 'cl-create-rosta-schedule',
  templateUrl: './create-rosta-schedule.component.html',
  styleUrls: ['./create-rosta-schedule.component.scss']
})
export class CreateRostaScheduleComponent implements OnInit {
  @HostBinding('class.handset')
  _handset = false;

  _from: string;
  _to: string;
  _currentDate: string;
  
  _selectedAttendees: User[] = [];

  constructor(private _breakpointObserver: BreakpointObserver,
              @Inject(MAT_DIALOG_DATA) private _config: CreateRostaScheduleConfig,
              private _userService: UsersService,
              private _dialogRef: MatDialogRef<CreateRostaScheduleComponent>,
              private _dialog: MatDialog) {}

  ngOnInit() {
    this._currentDate = moment(this._config.date).format('DD.MM');
    
    if (!this._config.schedule) {
      this._from = moment(this._config.date).format('HH:mm');
      this._to = moment(this._config.date).add(4, 'hours').format('HH:mm');
    } else {
      this._from = this._config.schedule.start.toString();
      this._to = this._config.schedule.end.toString();
      
      this._userService.listUsers()
        .subscribe(users => {
          this._selectedAttendees = users.filter(user => this._config.schedule.attendees.some(at => at.name === user.username))
        });
    }
    
    this._breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this._handset = result.matches;
    });
  }

  _trackUser(_: number, user: User) {
    return user.username;
  }

  _save() {
    let start = new Time(this._from);
    let end = new Time(this._to);
    this._dialogRef.close({
      attendees: this._selectedAttendees.map(user => ({name: user.username})),
      start: start,
      end: end,
      date: this._config.date,
      id: !!this._config.schedule ? this._config.schedule.id : null,
    });
  }

  _addAttendees() {
    this._dialog.open(SelectAttendeesDialogComponent, {
      data: this._selectedAttendees.map(u => u.username)
    })
      .afterClosed()
      .subscribe(users => {
        if (!users) {
          return;
        }

        this._selectedAttendees = users;
      });
  }
}
