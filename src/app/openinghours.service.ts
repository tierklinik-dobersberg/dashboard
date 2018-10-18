import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * TimeFrame represents a span between a start and end time
 */
export interface RemoteTimeFrame {
    /**
     * Beginning of the time frame
     */
    start: number;
    
    /**
     * End of the time frame
     */
    end: number;
}

export class Time {
  private _minutes: number;
  private _hours: number;

  constructor(minutes: number) {
    this._minutes = minutes % 60;
    this._hours = Math.floor(minutes / 60);
  }
  
  get minutes() { return this._minutes; }
  get hours() { return this._hours; }
  
  get totalMinutes() {
    return this._minutes + this._hours * 60;
  }
  
  toString() {
    return `${this._pad(this.hours, 2)}:${this._pad(this.minutes, 2)}`;
  }

  private _pad(value: number, size: number) {
    var s = String(value);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }
}

export interface TimeFrame {
  start: Time;
  end: Time;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface OpeningHoursConfig {
  [key: string]: TimeFrame[];
}


@Injectable({
  providedIn: 'root'
})
export class OpeningHoursService {
  constructor(private _http: HttpClient) { }
  
  getConfig(): Observable<OpeningHoursConfig> {
    return this._http.get<{[key: number]: {start: number, end: number}[]}>('/api/openinghours/config')
      .pipe(
        map(res => {
          const result: OpeningHoursConfig = {};

          Object.keys(res)
            .forEach(key => {
              let dayName = this.getKeyFromDay(+key);
              let frames = res[key].map(frame => {
                return {
                  start: new Time(frame.start),
                  end: new Time(frame.end),
                };
              });

              result[dayName] = frames;
            })
          
          return result;
        })
      )
  }

  addTimeFrame(day: number | WeekDay, start: Time, end: Time): Observable<void> {
    if (typeof day === 'number') {
      day = this.getKeyFromDay(day);
    }
    
    return this._http.put<void>(`/api/openinghours/config/${day}`, {
      start: start.totalMinutes,
      end: end.totalMinutes
    });
  }
  
  deleteTimeFrame(day: number | WeekDay, start: Time, end: Time): Observable<void> {
    if (typeof day === 'number') {
      day = this.getKeyFromDay(day);
    }
    
    return this._http.request<void>('DELETE', `/api/openinghours/config/${day}`, {
      body: {
        start: start.totalMinutes,
        end: end.totalMinutes
      },
      responseType: 'json',
      observe: 'body'
    });
  }
  
  getKeyFromDay(day: number): WeekDay {
    let keys: WeekDay[] = [
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
