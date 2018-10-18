import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Possible door states
 */
export type DoorState = 'unlock' | 'lock' | 'open';

/**
 * Time represents a localtime in the format of [HH, MM]
 * e.g. [08, 00] for 08:00 local time
 */
export type Time = [
    /**  hour  */ number,
    /** minute */ number
];

/**
 * Constant index values for accessing the hour and minute parts
 * of a {@link Time}
 */
export enum TimeIndex {
    Hour = 0,
    Minute = 1,
}

/**
 * TimeFrame represents a span between a start and end time
 */
export interface TimeFrame {
    /**
     * Beginning of the time frame
     */
    from: Time;
    
    /**
     * End of the time frame
     */
    to: Time;
}

export interface OpeningHours {
    monday: TimeFrame[];
    tuesday: TimeFrame[];
    wednesday: TimeFrame[];
    thursday: TimeFrame[];
    friday: TimeFrame[];
    saturday: TimeFrame[];
    sunday: TimeFrame[];
}

export interface DoorConfig {
    /**
     * The current state of the door
     */
    state: DoorState;
    
    /**
     * The timestamp until the state is applied
     */
    until: number;
    
    /**
     * The ISO time format until the state is applied
     */
    untilISO: string;
}

export interface OverwriteConfig {
    until: Time;
    state: DoorState;
}

/**
 * Definition of the scheduler file format
 */
export interface SchedulerConfig {
  // The number of seconds until the same door state should be sent
  // This is required as some commands will be lost if the door
  // is still open
  reconfigureInterval?: number;

  // The default schedules to unlock the door based
  // on a per week-day basis
  openingHours: OpeningHours;
  
  // If set, the current configuration for `openingHours` is ignored
  // and the door state is set according to the following {@link TimeFrame}
  // configuration. Once the time-frame passed, the configuration will reset
  // the overwrite to null and continue to use the default schedules
  currentOverwrite: OverwriteConfig|null;
}

export interface CurrentState {
  current: DoorConfig;
  config: SchedulerConfig;
}

@Injectable({
  providedIn: 'root'
})
export class DoorService {
  constructor(private _http: HttpClient) { }
  
  getCurrentState(): Observable<CurrentState> {
    return this._http.get<CurrentState>('/api/door/status', {
      responseType: 'json',
      headers: {
        'accept': 'application/json'
      }
    });
  }

  setState(state: DoorState, until: Date): Observable<void> {
    return this._http.put<void>(`/api/door/set/${state}`, until.getTime(), {
      headers: {
        'accept': 'application/json'
      }
    });
  }

  reset(): Observable<void> {
    return this._http.post<void>('/api/door/reset', undefined);
  }

  open(): Observable<void> {
    return this._http.post<void>('/api/door/open', undefined);
  }

  addTimeFrame(day: number | keyof OpeningHours, start: Time, end: Time): Observable<void> {
    if (typeof day === 'number') {
      day = this._getKeyFromDay(day);
    }
    
    return this._http.post<void>(`/api/door/config/${day}`, {from: start, to: end});
  }
  
  deleteTimeFrame(day: number | keyof OpeningHours, start: Time, end: Time): Observable<void> {
    if (typeof day === 'number') {
      day = this._getKeyFromDay(day);
    }
    
    return this._http.request<void>('DELETE', `/api/door/config/${day}`, {
      body: {from: start, to: end},
      responseType: 'json',
      observe: 'body'
    });
  }
  
  private _getKeyFromDay(day: number): keyof OpeningHours {
    let keys: (keyof OpeningHours)[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    ];
    
    return keys[day];
  }
}
