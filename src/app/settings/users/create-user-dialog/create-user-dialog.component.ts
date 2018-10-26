import { Optional, Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UserType, User } from 'src/app/users.service';
import { CropImageDialogComponent } from 'src/app/dialogs/crop-image-dialog/crop-image-dialog.component';

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

  _icon: string = '';

  @ViewChild('avatarContainer', {read: ElementRef})
  _avatarContainer: ElementRef;

  constructor(private _dialogRef: MatDialogRef<CreateUserDialogComponent>,
              private _dialog: MatDialog,
              @Optional() @Inject(MAT_DIALOG_DATA) public _userToEdit?: User) { }

  ngOnInit() {
    if (!!this._userToEdit) {
      this._username = this._userToEdit.username;
      this._type = this._userToEdit.type;
      this._isAdmin = this._userToEdit.role === 'admin';
      this._hoursPerWeek = this._userToEdit.hoursPerWeek;
      this._icon = this._userToEdit.icon || '';
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
    }
    this._dialogRef.close(user);
  }
}
