import {TimeFrame} from '../../openinghours.service';
import * as moment from 'moment';

/** DateSpan represents a span between days */
export interface DateSpan {
    /** The start day of the span */
    startDate: Date;
    
    /** The end day of the span */
    endDate: Date;
  }
  
  /**
   * Represents a section at a given day
   */
  export interface DaySection<T> extends TimeFrame {
    /** Optional data for the DaySection */
    data?: T;
  }
  
  /**
   * Represents an attendee for a meeting/appointment or schedule
   */
  export interface Attendee<T> {
    /** The name of the attendee */
    name: string;  
    
    /** URL for the attendee's icon */
    icon?: string;
    
    /** Additional data for the attendee */
    data?: T;
    
    /**
     * An optional attendee type. May be used by implementors to
     * distinguish between persons, rooms or any other inventory
     * required. For more type-safety extends the Attendee interface
     * and set `type` to the required value
     */
    type?: any;
  }
  
  /**
   * Schedule is a generic for something that should be displayed in the rosta
   */
  export interface Schedule<T> extends DaySection<T> {
    /** A list of attendees for this schedule */
    attendees?: Attendee<any>[];
  }
  
  /**
   * Configuration for a calendar day to be rendered at the rosta
   */
  export interface CalendarDay {
    /** The date this calendar day is abount */
    date: Date|moment.Moment;
    
    /** The localized name of the calendar day */
    name: string;
  
    /** Sections to display for the day */
    sections?: DaySection<any>[];
    
    /** A list of schedules to display */
    schedules?: Schedule<any>[];
  }
  