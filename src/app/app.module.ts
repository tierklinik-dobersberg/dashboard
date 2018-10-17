import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { DoorComponent } from './door/door.component';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { SelectTimeOffsetComponent } from './dialogs/select-time-offset/select-time-offset.component';
import { SettingsOverviewComponent } from './settings/overview/overview.component';
import { DoorSettingsComponent } from './settings/door/door.component';
import { DayConfigComponent } from './settings/door/day-config/day-config.component';
import { TimeFrameDialogComponent } from './settings/door/time-frame-dialog/time-frame-dialog.component';

// the second parameter 'fr' is optional
registerLocaleData(localeDe, 'de');

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DoorComponent,
    SelectTimeOffsetComponent,
    SettingsOverviewComponent,
    DoorSettingsComponent,
    DayConfigComponent,
    TimeFrameDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    MatButtonModule,
    MatCardModule,
    HttpClientModule,
    MatDialogModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,
    MatDatepickerModule,
    MatInputModule,
    MatMenuModule,
    MatFormFieldModule,
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    SelectTimeOffsetComponent,
    TimeFrameDialogComponent
  ]
})
export class AppModule { }
