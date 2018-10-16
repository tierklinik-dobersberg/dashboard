import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { DoorComponent } from './door/door.component';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { SelectTimeOffsetComponent } from './dialogs/select-time-offset/select-time-offset.component';

// the second parameter 'fr' is optional
registerLocaleData(localeDe, 'de');

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DoorComponent,
    SelectTimeOffsetComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    HttpClientModule,
    MatDialogModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatMenuModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    SelectTimeOffsetComponent
  ]
})
export class AppModule { }
