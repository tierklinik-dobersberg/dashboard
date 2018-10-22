import {Observable} from 'rxjs';
import {CalendarDay, DateSpan} from './types';

/**
 * CalendarViewer should be implemented by all components that
 * render calendar data.
 */
export interface CalendarViewer {
    /**
     * Emits an event whenever the date span rendered has changed
     * this allows a {@link CalendarSource} to emit new {@link CalendarDay}s
     * to be rendered
     */
    viewChange: Observable<DateSpan>;
  }
  
  export interface CalendarSource {
    /**
     * Connect is called by a CalendarViewer to receive an
     * observable emitting {@link CalendarDay}s
     * 
     * @param viewer - The viewer that want's to connect to the calendar source
     */
    connect(viewer: CalendarViewer): Observable<CalendarDay[]>;
    
    /**
     * Called by a previously connected {@link CalendarViewer}
     * 
     * @param viewer - The viewer that disconnects
     */
    disconnect(viewer: CalendarViewer): void;
  }
  