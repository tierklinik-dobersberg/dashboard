import { Optional, Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UserType, User } from 'src/app/users.service';
import { CropImageDialogComponent } from 'src/app/dialogs/crop-image-dialog/crop-image-dialog.component';
import { LoginService } from 'src/app/login.service';
import { IntegrationService } from 'src/app/integration.service';
import { CalendarService, CalendarListEntry } from 'src/app/calendar.service';

// Unfortunately there are no typings for blueimp-load-image
declare var loadImage: any;

@Component({
  selector: 'cl-create-user-dialog',
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss']
})
export class CreateUserDialogComponent implements OnInit {
  _username: string;
  _password: string;
  _type: UserType;
  _isAdmin: boolean = false;
  _hoursPerWeek: number;
  _firstname: string;
  _lastname: string;
  _phoneNumber: string;
  _mailAddress: string;
  _mustChangePassword: boolean = true;
  _calendarId: string = '';
  _canUseGoolge: boolean = false;
  
  _calendars: CalendarListEntry[] = [];

  _isCurrentUser: boolean = false;

  _icon: string = '';
  _editorIsAdmin = false;

  @ViewChild('avatarContainer', {read: ElementRef})
  _avatarContainer: ElementRef;

  constructor(private _dialogRef: MatDialogRef<CreateUserDialogComponent>,
              private _dialog: MatDialog,
              private _loginService: LoginService,
              private _integrationService: IntegrationService,
              private _calendarService: CalendarService,
              @Optional() @Inject(MAT_DIALOG_DATA) public _userToEdit?: User) { }

  ngOnInit() {
    this._editorIsAdmin = this._loginService.currentUser.role === 'admin';
    
    this._integrationService.getGoogleAuthStatus()
      .subscribe(res => {
        this._canUseGoolge = res.authenticated;
        
        if (this._canUseGoolge) {
          this._calendarService.listCalendars()
            .subscribe(res => this._calendars = res);
        }
      });

    if (!!this._userToEdit) {
      this._isCurrentUser = this._loginService.currentUser.username === this._userToEdit.username;
      
      this._username = this._userToEdit.username;
      this._type = this._userToEdit.type;
      this._isAdmin = this._userToEdit.role === 'admin';
      this._hoursPerWeek = this._userToEdit.hoursPerWeek;
      this._icon = this._userToEdit.icon || '';
      this._lastname = this._userToEdit.lastname;
      this._firstname = this._userToEdit.firstname;
      this._mailAddress = this._userToEdit.mailAddress;
      this._phoneNumber = this._userToEdit.phoneNumber;
      this._mustChangePassword = this._userToEdit.mustChangePassword;
      this._calendarId = this._userToEdit.googleCalendarID || '';
    }
  }

  _abort() {
    this._dialogRef.close();
  }
  
  _loadImage(event: any) {
    let file: File = event.target.files[0];
    loadImage(
      file,
      (img: HTMLCanvasElement) => {
        this._dialog.open(CropImageDialogComponent, {
          data: img.toDataURL()
        }).afterClosed()
          .subscribe(data => {
            if (!!data) {
              this._icon = data;
            } else {
              this._icon = '';
            }
          });
      },
      {
        maxWidth: 800,
        canvas: true
      }
    );
  }

  _save() {
    let user: (User&{password: string}) = {
      username: this._username,
      password: this._password,
      enabled: true,
      role: this._isAdmin ? 'admin' : 'user',
      type: this._type,
      hoursPerWeek: this._hoursPerWeek,
      icon: this._icon,
      color: '',
      firstname: this._firstname,
      lastname: this._lastname,
      phoneNumber: this._phoneNumber,
      mailAddress: this._mailAddress,
      googleCalendarID: this._calendarId,
      mustChangePassword: this._mustChangePassword
    }
    this._dialogRef.close(user);
  }
}
