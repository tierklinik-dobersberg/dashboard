import { Component, OnInit, ViewChildren, QueryList, Output, EventEmitter, ElementRef, Renderer2, OnDestroy, AfterViewInit } from '@angular/core';
import { OpeningHoursConfig, OpeningHoursService, WeekDay} from '../../openinghours.service';
import { DayConfigComponent } from './day-config/day-config.component';

export interface Day {
  key: WeekDay;
  label: string;
}

@Component({
  selector: 'cl-openinghours-settings',
  templateUrl: './openinghours.component.html',
  styleUrls: ['./openinghours.component.scss']
})
export class OpeningHoursSettingsComponent implements OnInit, OnDestroy, AfterViewInit {
  private _scrollSubscription: () => void = () => {};

  _config: OpeningHoursConfig | null = null;

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
    
    if (!this._elementRef.nativeElement.parentElement) {
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
  
  constructor(private _hours: OpeningHoursService,
              private _elementRef: ElementRef,
              private _renderer: Renderer2) { }

  _scrollTo(day: WeekDay) {
    if (!this._dayConfigs) {
      return;
    }
    
    const comp = this._dayConfigs.find(config => config.day === day);

    if (!!comp) {
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
    this._scrollSubscription = this._renderer.listen(this._elementRef.nativeElement.parentElement, 'scroll', (event) => {});
  }

  ngOnDestroy() {
    this._scrollSubscription();
  }
  
  _loadConfig() {
    this._hours.getConfig()
      .subscribe(config => {
        console.log(`COnfig: `, config);
        this._config = config;
      });
  }
}
