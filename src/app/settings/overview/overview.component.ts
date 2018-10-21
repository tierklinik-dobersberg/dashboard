import {Component, OnInit} from '@angular/core';
import {CalendarSource, CalendarViewer, CalendarDay} from '../rosta';
import {OpeningHoursService, WeekDay} from '../../openinghours.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators'
import * as moment from 'moment';

export class RostaSource implements CalendarSource {
  constructor(private _service: OpeningHoursService) {}
  
  connect(viewer: CalendarViewer): Observable<CalendarDay[]> {
    console.log(`Viewer ${Object.getPrototypeOf(viewer).constructor.name} connected`);
    return this._service.getConfig()
      .pipe(
        map(config => {
          let result: CalendarDay[] = [];
          const now = moment();
          
          // If we are currently on sunday make sure to 
          // send the "last" week as we start the week with monday
          if (now.day() === 0) {
            now.subtract(1, 'day');
          }

          // start with monday
          now.startOf('week');
          
          for (let i = 0; i < 7; i++) {
            const offsetDays = i + 1;
            const date = now.clone().add(offsetDays, 'days');
            const weekDay = this._service.getKeyFromDay(offsetDays % 7);
            
            result.push({
              date: date.toDate(),
              name: weekDay,
              sections: config[weekDay],
            });
          }

          return result;
        })
      );
  }
  
  disconnect(viewer: CalendarViewer) {
    console.log(`Viewer ${Object.getPrototypeOf(viewer).constructor.name} disconnected`);
  }
}

@Component({
  selector: 'cl-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class SettingsOverviewComponent implements OnInit {
  calendarSource: RostaSource;

  constructor(private _openingHourService: OpeningHoursService) { }

  ngOnInit() {
    this.calendarSource = new RostaSource(this._openingHourService)
  }
  
  _scrollTo(offset: number) {
    console.log(`scrolling to ${offset}`);
  }
}
