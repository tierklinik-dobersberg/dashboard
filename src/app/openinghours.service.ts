import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @internal 
 * TimeFrame represents a span between a start and end time
 */
interface RemoteTimeFrame {
    /**
     * The unique id for the time frame
     */
    id: number;

    /**
     * Beginning of the time frame
     */
    start: number;
    
    /**
     * End of the time frame
     */
    end: number;
}

/**
 * Time is a utility class that represents a time without any date
 * information
 */
export class Time {
  private _minutes: number;
  private _hours: number;

  constructor(minutes: number) {
    this._minutes = minutes % 60;
    this._hours = Math.floor(minutes / 60);
  }
  
  /**
   * Returns the number of minutes in the given hour
   */
  get minutes() { return this._minutes; }
  
  /**
   * Returns the hour
   */
  get hours() { return this._hours; }
  
  /**
   * Returns the total number of minutes from the beginning of the day
   */
  get totalMinutes() {
    return this._minutes + this._hours * 60;
  }
  
  /** Returns a string representation in the format HH:MM */
  toString() {
    return `${this._pad(this.hours, 2)}:${this._pad(this.minutes, 2)}`;
  }

  /**
   * @internal
   * 
   * Pads a given number to reach the desired count of characters
   * The number is padded with zeros.
   * 
   * @example this._pad(8, 2) // returns "02"
   * 
   * @param value - The value to pad
   * @param size - The desired number of charaters to return
   */
  private _pad(value: number, size: number): string {
    var s = String(value);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }
}

/**
 * TimeFrame represents a time span within a day
 */
export interface TimeFrame {
  /** The unique ID of the time frame */
  id: number;
  
  /** The start time in absolute minutes from the beginning of the day */
  start: Time;
  
  /** The end time in absolute minutes from the beginning of the time */
  end: Time;
}

/** All possible weekdays */
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * OpeningHoursConfig contains all opening hour time-frames for each weekday
 * where the key is the name of the weekday.
 * {@see WeekDay}
 */
export interface OpeningHoursConfig {
  [key: string]: TimeFrame[];
}


@Injectable({
  providedIn: 'root'
})
export class OpeningHoursService {
  constructor(private _http: HttpClient) { }
  
  /**
   * Loads the current opening hour configuration from the backend
   * and returns it as a {@link OpeningHoursConfig}
   */
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
                  id: frame.id,
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

  
  /**
   * Adds a new time span to the given weekday
   * 
   * @param day - The number of name of the weekday
   * @param start - The start of the time span
   * @param end - The end of the time span
   */
  addTimeFrame(day: number | WeekDay, start: Time, end: Time): Observable<void> {
    if (typeof day === 'number') {
      day = this.getKeyFromDay(day);
    }
    
    return this._http.put<void>(`/api/openinghours/config/${day}`, {
      start: start.totalMinutes,
      end: end.totalMinutes
    });
  }
  
  /**
   * Removes a time frame from a given weekday
   * 
   * @param day - The number or name of the weekday
   * @param start - The start of the time span
   * @param end - The end of the time span
   */
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
  
  /**
   * Converts a weekday number into it's key/string representation
   * 
   * @param day - The number of the weekday (sunday = 0; saturday = 6)
   */
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
