import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { OpeningHoursService, WeekDay, TimeFrame } from '../../../openinghours.service';
import { MatDialog } from '@angular/material/dialog';
import { TimeFrameDialogComponent } from '..//time-frame-dialog/time-frame-dialog.component';

@Component({
  selector: 'cl-day-config',
  templateUrl: './day-config.component.html',
  styleUrls: ['./day-config.component.scss']
})
export class DayConfigComponent implements OnInit {

  constructor(private _hours: OpeningHoursService,
              private _dialog: MatDialog,
              public readonly elementRef: ElementRef) { }
  
  @Input()
  day: WeekDay | null = null;

  @Input()
  label: string;

  @Input()
  config: TimeFrame[] = [];
  
  @Output()
  readonly changed: EventEmitter<void> = new EventEmitter();
  
  _deleteTimeFrame(frame: TimeFrame): void {
    this._hours.deleteTimeFrame(this.day, frame.start, frame.end)
      .subscribe(() => this.changed.next());
  }
  
  _addTimeFrame(): void {
    this._dialog.open(TimeFrameDialogComponent, {data: this.label})
      .afterClosed()
      .subscribe(res => {
        if (!res) {
          return;
        }
        
        this._hours.addTimeFrame(this.day, res.start, res.end)
          .subscribe(() => this.changed.next());
      });
  }

  ngOnInit() {}

}
