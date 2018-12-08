import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as moment from 'moment';

export interface CalendarListEntry {
    id: string;
    name: string;
    backgroundColor: string;
    foregroundColor: string;
}

export interface CalendarEvent {
    summary: string;
    description: string;
    id: string;
    calendarId: string;
    start: moment.Moment;
    end: moment.Moment;
}

@Injectable({providedIn: 'root'})
export class CalendarService {
    constructor(private _http: HttpClient) {}
    
    listCalendars(): Observable<CalendarListEntry[]> {
        return this._http.get<CalendarListEntry[]>('/api/calendar/');
    }

    createCalendar(name: string, backgroundColor: string, foregroundColor: string): Observable<void> {
        return this._http.post<void>('/api/calendar/', {
            name,
            backgroundColor,
            foregroundColor
        });
    }

    
    updateCalendar(id: string, name: string, backgroundColor: string, foregroundColor: string): Observable<void> {
        return this._http.put<void>(`/api/calendar/${id}`, {
            name,
            backgroundColor,
            foregroundColor
        });
    }
    
    deleteCalendar(id: string): Observable<void> {
        return this._http.delete<void>(`/api/calendar/${id}`);
    }
    
    listEvents(ids: string[], from?: Date, to?: Date): Observable<CalendarEvent[]> {
        return this._http.get<CalendarEvent[]>('/api/calendar/events', {
            params: {
                calendarId: ids,
                from: !!from ? ''+from.toISOString() : undefined,
                to: !!to ? ''+to.toISOString() : undefined,
            }
        }).pipe(
            map(res => {
                return res.map(event => {
                    return {
                        ...event,
                        start: moment(event.start),
                        end: moment(event.end)
                    }
                })
            })
        );
    }
}