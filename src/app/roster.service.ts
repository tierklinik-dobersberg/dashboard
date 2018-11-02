import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Schedule } from './components/calendar';
import { User } from './users.service';

export interface RosterScheduleType {
  id: number;
  color: string;
  type: string;
}

export interface RemoteRoster {
  id: number;
  
  calendarWeek: string;
  
  startDate: number;
  
  endDate: number;
  
  schedules: RemoteRosterSchedule[];
}

export interface RemoteRosterSchedule {
  start: number;
  end: number;
  users: User[];
  color: string;
  weekDay: number;
  id: number;
  type: RosterScheduleType;
}

@Injectable({
  providedIn: 'root'
})
export class RosterService {

  constructor(private _http: HttpClient) { }
  
  getTypes(): Observable<RosterScheduleType[]> {
    return this._http.get<RosterScheduleType[]>('/api/roster/types');
  }
  
  createType(type: string, color: string): Observable<RosterScheduleType> {
    return this._http.post<RosterScheduleType>('/api/roster/types', {
      name: type,
      color: color,
    });
  }
  
  deleteType(id: number): Observable<void> {
    return this._http.delete<void>(`/api/roster/types/${id}`);
  }
  
  getRemoteSchedules(start: number, end: number): Observable<RemoteRoster[]> {
  
    // if the schedules are for the current isoWeek, load them instead
    // this allows the service worker to always cache the current roster schedules
    // without interfering with other range requests
    const startWeek = moment(start).startOf('isoWeek');
    const endWeek = moment(end).endOf('isoWeek');
    if (startWeek.valueOf() === moment().startOf('isoWeek').valueOf()
        && endWeek.valueOf() === moment().endOf('isoWeek').valueOf()) {
      return this.getCurrentSchedules();
    }

    return this._http.get<RemoteRoster[]>('/api/roster/schedules', {params: {from: ''+start, to: ''+end}});
  }
  
  getCurrentSchedules(): Observable<RemoteRoster[]> {
    return this._http.get<RemoteRoster[]>('/api/roster/current');
  }

  createSchedule(date: Date, schedule: Schedule<any>): Observable<void> {
    return this._http.post<void>('/api/roster/schedules', {
      start: schedule.start.totalMinutes,
      end: schedule.end.totalMinutes,
      users: schedule.attendees.map(at => at.name),
      color: '',
      type: schedule.type.id,
      date: date.getTime(),
    });
  }

  editSchedule(date: Date, schedule: Schedule<any>): Observable<void> {
    return this._http.put<void>(`/api/roster/schedules/${schedule.id}`, {
      start: schedule.start.totalMinutes,
      end: schedule.end.totalMinutes,
      users: schedule.attendees.map(at => at.name),
      color: '',
      type: schedule.type.id,
      date: date.getTime(),
    });
  }

  deleteSchedule(id: number): Observable<void> {
    return this._http.delete<void>(`/api/roster/schedules/${id}`);
  }
}
