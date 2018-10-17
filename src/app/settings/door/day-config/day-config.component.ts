import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { TimeFrame, OpeningHours, DoorService } from '../../../door.service';
import { MatDialog } from '@angular/material/dialog';
import { TimeFrameDialogComponent } from '..//time-frame-dialog/time-frame-dialog.component';

@Component({
  selector: 'cl-day-config',
  templateUrl: './day-config.component.html',
  styleUrls: ['./day-config.component.scss']
})
export class DayConfigComponent implements OnInit {

  constructor(private _door: DoorService,
              private _dialog: MatDialog,
              public readonly elementRef: ElementRef) { }
  
  @Input()
  day: keyof OpeningHours | null = null;

  @Input()
  label: string;

  @Input()
  config: TimeFrame[] = [];
  
  @Output()
  readonly changed: EventEmitter<void> = new EventEmitter();
  
  _deleteTimeFrame(frame: TimeFrame): void {
    this._door.deleteTimeFrame(this.day, frame.from, frame.to)
      .subscribe(() => this.changed.next());
  }
  
  _addTimeFrame(): void {
    this._dialog.open(TimeFrameDialogComponent, {data: this.label})
      .afterClosed()
      .subscribe(res => {
        if (!res) {
          return;
        }
        
        this._door.addTimeFrame(this.day, res.from, res.to)
          .subscribe(() => this.changed.next());
      });
  }

  ngOnInit() {}

}
