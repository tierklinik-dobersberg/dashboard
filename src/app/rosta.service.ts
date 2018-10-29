import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Schedule } from './components/calendar';
import { User } from './users.service';

export interface RostaScheduleType {
  id: number;
  type: string;
}

export interface RemoteRosta {
  id: number;
  
  calendarWeek: string;
  
  startDate: number;
  
  endDate: number;
  
  schedules: RemoteRostaSchedule[];
}

export interface RemoteRostaSchedule {
  start: number;
  end: number;
  users: User[];
  color: string;
  weekDay: number;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class RostaService {

  constructor(private _http: HttpClient) { }
  
  getTypes(): Observable<RostaScheduleType[]> {
    return this._http.get<RostaScheduleType[]>('/api/rosta/types');
  }
  
  createType(type: string): Observable<RostaScheduleType> {
    return this._http.post<RostaScheduleType>('/api/rosta/types', {
      name: type,
    });
  }
  
  deleteType(id: number): Observable<void> {
    return this._http.delete<void>(`/api/rosta/types/${id}`);
  }
  
  getRemoteSchedules(start: number, end: number): Observable<RemoteRosta[]> {
  
    // if the schedules are for the current isoWeek, load them instead
    // this allows the service worker to always cache the current rosta schedules
    // without interfering with other range requests
    const startWeek = moment(start).startOf('isoWeek');
    const endWeek = moment(end).endOf('isoWeek');
    if (startWeek.valueOf() === moment().startOf('isoWeek').valueOf()
        && endWeek.valueOf() === moment().endOf('isoWeek').valueOf()) {
      return this.getCurrentSchedules();
    }

    return this._http.get<RemoteRosta[]>('/api/rosta/schedules', {params: {from: ''+start, to: ''+end}});
  }
  
  getCurrentSchedules(): Observable<RemoteRosta[]> {
    return this._http.get<RemoteRosta[]>('/api/rosta/current');
  }

  createSchedule(date: Date, schedule: Schedule<any>): Observable<void> {
    return this._http.post<void>('/api/rosta/schedules', {
      start: schedule.start.totalMinutes,
      end: schedule.end.totalMinutes,
      users: schedule.attendees.map(at => at.name),
      color: '',
      type: 1,
      date: date.getTime(),
    });
  }

  editSchedule(date: Date, schedule: Schedule<any>): Observable<void> {
    return this._http.put<void>(`/api/rosta/schedules/${schedule.id}`, {
      start: schedule.start.totalMinutes,
      end: schedule.end.totalMinutes,
      users: schedule.attendees.map(at => at.name),
      color: '',
      type: 1,
      date: date.getTime(),
    });
  }

  deleteSchedule(id: number): Observable<void> {
    return this._http.delete<void>(`/api/rosta/schedules/${id}`);
  }
}
