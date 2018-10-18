import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LayoutModule } from '@angular/cdk/layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { DoorComponent } from './door/door.component';

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
import { RostaComponent } from './settings/rosta/rosta.component';
import { OpeningHourDirective } from './settings/rosta/opening-hour.directive';

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
    RostaComponent,
    OpeningHourDirective
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
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    SelectTimeOffsetComponent,
    TimeFrameDialogComponent,
    CreateUserDialogComponent,
    ConfirmationComponent
  ]
})
export class AppModule { }
