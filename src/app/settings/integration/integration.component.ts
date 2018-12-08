import { OnInit, Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IntegrationService, GoogleAuthStatus } from 'src/app/integration.service';
import { CalendarService } from 'src/app/calendar.service';

@Component({
    selector: 'cl-integration',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'integration.component.html',
    styleUrls: ['integration.component.scss']
})
export class IntegrationComponent implements OnInit {
    _authenticated: boolean = false;
    _url: string;
    _code: string = '';
    _profile: {name: string; picture: string} | null = null;
    _calendarCount = 0;

    constructor(private _integrationService: IntegrationService,
                private _calendarService: CalendarService,
                private _changeDetector: ChangeDetectorRef) {}
    
    ngOnInit() {
        this._integrationService.getGoogleAuthStatus()
            .subscribe(res => this._updateProfile(res));
    }
    
    authorize() {
        this._integrationService.authorzite(this._code)
            .subscribe(res => this._updateProfile(res));
    }

    unauthorize() {
        this._integrationService.unauthorizeGoogle()
            .subscribe((res) => this._updateProfile(res))
    }

    private _updateProfile(res: GoogleAuthStatus) {
        this._authenticated = res.authenticated;
        this._url = res.authURL;
        this._profile = res.profile || null;
        
        if(this._authenticated) {
            this._calendarService.listCalendars()
                .subscribe(list => {
                    console.log(list);
                    this._calendarCount = list.length;
                    
                    this._changeDetector.markForCheck();
                });
        }

        this._changeDetector.markForCheck();
    }
}