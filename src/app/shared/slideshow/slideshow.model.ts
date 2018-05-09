import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery';
export class SlideShow {

  constructor(public title: string, public galleryImages: NgxGalleryImage[], public galleryOptions?: NgxGalleryOptions[]) {
    if (!this.galleryOptions) {
      this.galleryOptions = [
        {
          width: '30rem',
          height: '20rem',
          thumbnailsColumns: 4
        }
      ];
    }
  }
}
