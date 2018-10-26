import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { Schedule } from './components/calendar';
import { User } from './users.service';

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
  
  getRemoteSchedules(start: number, end: number): Observable<RemoteRosta[]> {
    return this._http.get<RemoteRosta[]>('/api/rosta/schedules', {params: {from: ''+start, to: ''+end}});
  }
  
  createSchedule(date: Date, schedule: Schedule<any>): Observable<void> {
    return this._http.post<void>('/api/rosta/schedules', {
      start: schedule.start.totalMinutes,
      end: schedule.end.totalMinutes,
      users: schedule.attendees.map(at => at.name),
      color: '',
      date: date.getTime(),
    });
  }

  editSchedule(date: Date, schedule: Schedule<any>): Observable<void> {
    return this._http.put<void>(`/api/rosta/schedules/${schedule.id}`, {
      start: schedule.start.totalMinutes,
      end: schedule.end.totalMinutes,
      users: schedule.attendees.map(at => at.name),
      color: '',
      date: date.getTime(),
    });
  }

  deleteSchedule(id: number): Observable<void> {
    return this._http.delete<void>(`/api/rosta/schedules/${id}`);
  }
}
