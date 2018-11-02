import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, HostBinding, Inject, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { Time } from 'src/app/openinghours.service';
import { RosterScheduleType, RosterService } from 'src/app/roster.service';
import { Schedule } from '../../components/calendar';
import { User, UsersService } from '../../users.service';

export interface CreateRosterScheduleConfig {
  date: Date;
  end?: Date;
  schedule?: Schedule<any>;
  disallowedUsers: string[];
}

interface SelectableUser extends User {
  selected: boolean;
}

@Component({
  selector: 'cl-create-roster-schedule',
  templateUrl: './create-roster-schedule.component.html',
  styleUrls: ['./create-roster-schedule.component.scss']
})
export class CreateRosterScheduleComponent implements OnInit {
  @HostBinding('class.handset')
  _handset = false;

  _from: string;
  _to: string;
  _currentDate: string;
  _types: RosterScheduleType[];
  _type: number;
  _filterType: string = 'all';
  _users: SelectableUser[] = [];

  _isLastStep: boolean = false;
  
  _selectedAttendees: User[] = [];

  constructor(private _breakpointObserver: BreakpointObserver,
              @Inject(MAT_DIALOG_DATA) private _config: CreateRosterScheduleConfig,
              private _userService: UsersService,
              private _rostaService: RosterService,
              private _dialogRef: MatDialogRef<CreateRosterScheduleComponent>,
              private _dialog: MatDialog) {}

  ngOnInit() {
    this._currentDate = moment(this._config.date).format('DD.MM');
    
    if (!this._config.schedule) {
      this._from = moment(this._config.date).format('HH:mm');
      if (!!this._config.end) {
        this._to = moment(this._config.end).format('HH:mm');
      } else {
        this._to = moment(this._config.date).add(4, 'hours').format('HH:mm');
      }
      
    } else {
      this._from = this._config.schedule.start.toString();
      this._to = this._config.schedule.end.toString();
      this._type = this._config.schedule.type.id;
    }
    
    this._loadTypes();
    this._loadUsers();
    
    this._breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait,
    ]).subscribe(result => {
      this._handset = result.matches;
    });
  }

  private _loadUsers() {
    this._userService.listUsers()
        .subscribe(users => {
          if (!!this._config.schedule) {
            this._selectedAttendees = users.filter(user => this._config.schedule.attendees.some(at => at.name === user.username))
          }
          
          this._users = users
            .map(user => ({
              ...user,
              selected: this._selectedAttendees.find(at => at.username === user.username) !== undefined
            }))
            .filter(user => {
              if (this._filterType === 'all') {
                return true;
              }
              
              return user.type === this._filterType;
            });
        });
  }
  
  private _loadTypes() {
    this._rostaService.getTypes()
      .subscribe(types => {
        this._types = types;
        if (this._type === undefined) {
          this._type = types[0].id;
        }
      });
  }

  _stepChanged(event: StepperSelectionEvent) {
    this._isLastStep = event.selectedIndex === 1;
  }

  _trackUser(_: number, user: User) {
    return user.username;
  }
  
  _toggleUser(user: SelectableUser, event: MatCheckboxChange) {
    console.log(`toggling user ${user.username} to ${event.checked}`);
    user.selected = event.checked;
    
    if (!user.selected) {
      let idx = this._selectedAttendees.findIndex(at => at.username === user.username);
      if (idx > -1) {
        this._selectedAttendees.splice(idx, 1);
      }
    }
    
    if (user.selected && this._selectedAttendees.find(at => at.username === user.username) === undefined) {
      this._selectedAttendees.push(user);
    }
  }

  _save() {
    let start = new Time(this._from);
    let end = new Time(this._to);
    console.log(this._selectedAttendees);
    this._dialogRef.close({
      attendees: this._selectedAttendees.map(user => ({name: user.username})),
      start: start,
      end: end,
      date: this._config.date,
      id: !!this._config.schedule ? this._config.schedule.id : null,
      type: this._types.find(type => type.id === this._type)
    });
  }
}
