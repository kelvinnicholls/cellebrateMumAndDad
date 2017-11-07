
import { EventEmitter } from "@angular/core";
import { SlideShow } from "./slideshow.model";
import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery';

export class SlideShowService {
    //slideShow: SlideShow;


    showSlideShowSub = new EventEmitter<SlideShow>();

    showSlideShow(title: string, galleryImages: NgxGalleryImage[], galleryOptions?: NgxGalleryOptions[]) {
        const slideShow = new SlideShow(title, galleryImages, galleryOptions);
        this.showSlideShowSub.emit(slideShow);
    }
}