import { Component, OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { interval, Subject, BehaviorSubject } from 'rxjs';
import { flatMap, takeUntil, combineLatest, startWith } from 'rxjs/operators';
import { CurrentState, DoorService, DoorState, SchedulerConfig } from '../door.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectTimeOffsetComponent } from '../dialogs/select-time-offset/select-time-offset.component';

@Component({
  selector: 'cl-door',
  templateUrl: './door.component.html',
  styleUrls: ['./door.component.scss']
})
export class DoorComponent implements OnInit, OnDestroy {
  private readonly _unsubscribe = new Subject<void>();
  private readonly _triggerUpdate = new BehaviorSubject<null>(null);
  private _validUntil: Date | null = null;
  private _currentState: DoorState | null = null;
  private _confirmDialogRef: MatDialogRef<any> | null = null;
  private _currentConfig: SchedulerConfig | null;
  
  @ViewChild('confirm')
  _confirmTemplate: TemplateRef<any>;

  get validUntil(): Date {
    if (!this._validUntil) {
      return new Date();
    }
    return this._validUntil;
  }

  get isAutomatic(): boolean {
    if (!this._currentConfig) {
      return true;
    }
    
    return !!this._currentConfig.currentOverwrite;
  }
  

  get state(): DoorState {
    return this._currentState;
  }
  
  get currentState(): string {
    if (!this._currentState) {
      return 'loading';
    }
    
    switch(this._currentState) {
    case 'lock':
      return 'Gesperrt'
    case 'unlock':
      return 'Entsperrt';
    case 'open':
      return 'Kurzzeitig geöffnet'
    }
    
    return '';
  }


  constructor(private _door: DoorService,
              private _dialog: MatDialog) { }

  ngOnInit() {
    this._setupPoller();
  }
  
  ngOnDestroy() {
    this._unsubscribe.next();
    this._unsubscribe.complete();
    this._triggerUpdate.complete();
  }
  
  setState(state: DoorState): void {
    if (state === 'open') {
      this._door.open()
        .subscribe(() => this._triggerUpdate.next(null));
      return;
    }
    this._dialog.open(SelectTimeOffsetComponent, {data: state})
      .afterClosed()
      .subscribe((result: number) => {
        if (result === undefined) {
          return;
        }
        
        let until = new Date(new Date().getTime() + (result * 60 * 1000));
        this._door.setState(state, until)
          .subscribe(() => this._triggerUpdate.next(null));
      });
      
  }
  
  reset() {
    this._confirmDialogRef = this._dialog.open(this._confirmTemplate);
    
    this._confirmDialogRef
      .afterClosed()
      .subscribe((res) => {
        if (!!res) {
          this._door.reset()
            .subscribe(() => this._triggerUpdate.next(null));
        }
        this._confirmDialogRef = null;
      });
  }

  _confirmReset() {
    this._confirmDialogRef.close(true);
  }
  
  _abortReset() {
    this._confirmDialogRef.close();
  }
  
  private _updateState(state: CurrentState): void {
    this._validUntil = new Date(state.current.until);
    this._currentState = state.current.state;
    this._currentConfig = state.config;
  }
  
  private _setupPoller() {
    interval(5000)
      .pipe(
        startWith(0),
        combineLatest(this._triggerUpdate),
        takeUntil(this._unsubscribe),
        flatMap(() => this._door.getCurrentState()),
      )
      .subscribe(state => this._updateState(state));
  }
}
