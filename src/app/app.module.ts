import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule  } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LayoutModule } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DoorComponent } from './door/door.component';
import { ColorPickerModule } from 'ngx-color-picker';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { SelectTimeOffsetComponent } from './dialogs/select-time-offset/select-time-offset.component';
import { SettingsOverviewComponent } from './settings/overview/overview.component';
import { OpeningHoursSettingsComponent } from './settings/openinghours/openinghours.component';
import { DayConfigComponent } from './settings/openinghours/day-config/day-config.component';
import { TimeFrameDialogComponent } from './settings/openinghours/time-frame-dialog/time-frame-dialog.component';
import { UsersComponent } from './settings/users/users.component';
import { CreateUserDialogComponent } from './settings/users/create-user-dialog/create-user-dialog.component';
import { RolePipe } from './settings/users/role.pipe';
import { UsertypePipe } from './settings/users/usertype.pipe';
import { ConfirmationComponent } from './dialogs/confirmation/confirmation.component';
import { TdCalendarComponent, TdDaySectionDef, TdDayScheduleDef} from './components/calendar';
import { CreateRosterScheduleComponent } from './dialogs/create-roster-schedule/create-roster-schedule.component';
import { RosterComponent } from './components/roster/roster.component';
import { CropImageDialogComponent } from './dialogs/crop-image-dialog/crop-image-dialog.component';
import { LoginComponent } from './login/login.component';
import { LoginService } from './login.service';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordDialogComponent } from './dialogs/change-password-dialog/change-password-dialog.component';
import { RosterTypesComponent } from './settings/roster-types/roster-types.component';
import { RosterTypeDialogComponent } from './dialogs/roster-type-dialog/roster-type-dialog.component';
import { HypnoloadComponent } from './components/hypnoload/hypnoload.component';
import { RosterWidgetComponent } from './widgets/roster-widget/roster-widget.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// the second parameter 'fr' is optional
registerLocaleData(localeDe, 'de');

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DoorComponent,
    SelectTimeOffsetComponent,
    SettingsOverviewComponent,
    OpeningHoursSettingsComponent,
    DayConfigComponent,
    TimeFrameDialogComponent,
    UsersComponent,
    CreateUserDialogComponent,
    RolePipe,
    UsertypePipe,
    ConfirmationComponent,
    TdCalendarComponent,
    TdDaySectionDef,
    TdDayScheduleDef,
    CreateRosterScheduleComponent,
    RosterComponent,
    CropImageDialogComponent,
    LoginComponent,
    ProfileComponent,
    ChangePasswordDialogComponent,
    RosterTypesComponent,
    RosterTypeDialogComponent,
    HypnoloadComponent,
    RosterWidgetComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    HttpClientModule,
    MatDialogModule,
    MatSelectModule,
    LayoutModule,
    MatListModule,
    MatIconModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatInputModule,
    MatMenuModule,
    MatTableModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSidenavModule,
    MatTabsModule,
    MatSnackBarModule,
    MatStepperModule,
    ColorPickerModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: LoginService,
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    SelectTimeOffsetComponent,
    TimeFrameDialogComponent,
    CreateUserDialogComponent,
    ConfirmationComponent,
    CreateRosterScheduleComponent,
    CropImageDialogComponent,
    ChangePasswordDialogComponent,
    RosterTypeDialogComponent
  ]
})
export class AppModule { }
