import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventEmitter } from "@angular/core";
import { SlideShow } from "./slideshow.model";
import { SlideShowService } from "./slideshow.service";
import { Consts } from "../../shared/consts";

import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery';

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.css']
})
export class SlideShowComponent implements OnDestroy {
  slideShow: SlideShow;
  display = 'none';

  title = "TITLE";

  private showSlideShowSub: EventEmitter<SlideShow>;

  constructor(private slideShowService: SlideShowService) { }

  onClose() {
    this.display = 'none';
  }


  destroy(sub: any) {
    if (sub) {
      sub.unsubscribe();
      sub = null;
    }
  }

  ngOnDestroy() {
    this.destroy(this.showSlideShowSub);
  }

  ngOnInit() {
    let galleryImages: NgxGalleryImage[]  = [
      {
        small: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/1-small.jpeg',
        medium: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/1-medium.jpeg',
        big: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/1-big.jpeg'
      },
      {
        small: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/2-small.jpeg',
        medium: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/2-medium.jpeg',
        big: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/2-big.jpeg'
      },
      {
        small: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/3-small.jpeg',
        medium: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/3-medium.jpeg',
        big: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/3-big.jpeg'
      },
      {
        small: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/4-small.jpeg',
        medium: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/4-medium.jpeg',
        big: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/4-big.jpeg'
      },
      {
        small: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/5-small.jpeg',
        medium: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/5-medium.jpeg',
        big: 'https://lukasz-galka.github.io/ngx-gallery-demo/assets/img/5-big.jpeg'
      }      
    ];

    this.slideShow = new SlideShow("TiTlE", galleryImages);
    this.showSlideShowSub = this.slideShowService.showSlideShowSub
      .subscribe(
      (slideShow: SlideShow) => {
        this.slideShow = slideShow;
        this.title = this.slideShow.title;
        this.display = 'block';
      });
  }


}