import { Component, OnInit, Inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as cropper from 'cropperjs';

@Component({
  selector: 'cl-crop-image-dialog',
  templateUrl: './crop-image-dialog.component.html',
  styleUrls: ['./crop-image-dialog.component.scss']
})
export class CropImageDialogComponent implements OnInit, OnDestroy {
  @ViewChild('imageContainer', {read: ElementRef})
  _imageContainer: ElementRef;
  
  private _cropper: cropper.default;

  constructor(private _dialogRef: MatDialogRef<CropImageDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private _imageBlogURL: string) { }

  ngOnInit() {
    this._imageContainer.nativeElement.src = this._imageBlogURL;
    
    this._cropper = new cropper.default(this._imageContainer.nativeElement, {
      aspectRatio: 1,
      viewMode: 1,
    });
  }

  _save() {
    this._dialogRef.close(this._cropper.getCroppedCanvas().toDataURL());
  }

  ngOnDestroy() {
    this._cropper.destroy();
  }
}
