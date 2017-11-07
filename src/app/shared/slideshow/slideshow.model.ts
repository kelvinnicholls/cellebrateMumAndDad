import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery';
export class SlideShow {

  constructor(public title: string, public galleryImages: NgxGalleryImage[], public galleryOptions?: NgxGalleryOptions[]) {
    if (!this.galleryOptions) {
      this.galleryOptions = [
        {
          width: '300px',
          height: '200px',
          thumbnailsColumns: 4
        }
      ];
    }
  }
}
