import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { RosterService, RemoteRosterSchedule } from 'src/app/roster.service';
import { User, UsersService } from 'src/app/users.service';
import { Time } from 'src/app/openinghours.service';

@Component({
  selector: 'cl-roster-widget',
  templateUrl: './roster-widget.component.html',
  styleUrls: ['./roster-widget.component.scss']
})
export class RostaWidgetComponent implements OnInit {
  _schedules: RemoteRosterSchedule[] = [];

  constructor(private _userService: UsersService,
              private _rostaService: RosterService) { }

  ngOnInit() {
    this._load();
  }
  
  _trackUser(_: number, user: User) {
    return user.username;
  }
  
  _trackSchedule(_: number, sched: RemoteRosterSchedule) {
    return sched.id;
  }

  _formatTime(t: number) {
    return new Time(t).toString();
  }
  
  private _load() {
    const start = moment().startOf('day')    ;
    const end = moment().endOf('day');

    this._rostaService.getRemoteSchedules(start.valueOf(), end.valueOf())
      .subscribe(rostas => {
        let schedules: RemoteRosterSchedule[] = [];

        rostas.forEach(rosta => {
          rosta.schedules.forEach(sched => {
            schedules.push(sched);
          });
        });
        
        this._schedules = schedules;
      });
  }
}
