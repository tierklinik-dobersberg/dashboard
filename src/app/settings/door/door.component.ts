import { Component, OnInit, ViewChildren, QueryList, Output, EventEmitter, ElementRef, Renderer2, OnDestroy, AfterViewInit } from '@angular/core';
import { DoorService, SchedulerConfig, OpeningHours } from '../../door.service';
import { map } from 'rxjs/operators';
import { DayConfigComponent } from './day-config/day-config.component';

export interface Day {
  key: keyof OpeningHours;
  label: string;
}

@Component({
  selector: 'cl-door-settings',
  templateUrl: './door-settings.component.html',
  styleUrls: ['./door-settings.component.scss']
})
export class DoorSettingsComponent implements OnInit, OnDestroy, AfterViewInit {
  private _scrollSubscription: () => void = () => {};

  _config: SchedulerConfig | null = null;

  @ViewChildren('dayConfig')
  _dayConfigs: QueryList<DayConfigComponent>;

  @Output()
  readonly scrollTo: EventEmitter<number> = new EventEmitter();

  get config() {
    return this._config!;
  }

  get scrollTop(): number {
    if (!this._elementRef) {
      return 0;
    }
    
    return this._elementRef.nativeElement.parentElement.scrollTop;
  }
  
  readonly days: Day[] = [
    {
      key: 'monday', label: 'Montag',
    },
    {
      key: 'tuesday', label: 'Dienstag'
    },
    {
      key: 'wednesday', label: 'Mittwoch'
    },
    {
      key: 'thursday', label: 'Donnerstag'
    },
    {
      key: 'friday', label: 'Freitag'
    },
    {
      key: 'saturday', label: 'Samstag'
    },
    {
      key: 'sunday', label: 'Sonntag'
    },
  ]
  
  constructor(private _door: DoorService,
              private _elementRef: ElementRef,
              private _renderer: Renderer2) { }

  _scrollTo(day: keyof OpeningHours) {
    if (!this._dayConfigs) {
      return;
    }
    
    const comp = this._dayConfigs.find(config => config.day === day);

    if (!!comp) {
      console.log(`Scrolling to ${day} at position: ${comp.elementRef.nativeElement.offsetTop}`);
      this.scrollTo.next(comp.elementRef.nativeElement.offsetTop);
      
      (this._elementRef.nativeElement as HTMLElement).parentElement
        .scroll({
          top: comp.elementRef.nativeElement.offsetTop, 
          left: 0, 
          behavior: 'smooth' 
        });
    }
  }

  _scrollUp() {
    this.scrollTo.next(0);
    (this._elementRef.nativeElement as HTMLElement).parentElement
        .scroll({
          top: 0, 
          left: 0, 
          behavior: 'smooth' 
        });
  }

  ngOnInit() {
    this._loadConfig();
  }

  ngAfterViewInit() {
    this._scrollSubscription = this._renderer.listen(this._elementRef.nativeElement.parentElement, 'scroll', (event) => {
      console.log(event);
    });
  }

  ngOnDestroy() {
    this._scrollSubscription();
  }
  
  _loadConfig() {
    this._door.getCurrentState()
      .pipe(
        map(state => state.config)
      )
      .subscribe(config => {
        console.log('Received data', config);
        this._config = config;
      });
  }
}
