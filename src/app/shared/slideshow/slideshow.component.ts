import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventEmitter } from "@angular/core";
import { SlideShow } from "./slideshow.model";
import { SlideShowService } from "./slideshow.service";
import { Consts } from "../../shared/consts";

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.css']
})
export class SlideShowComponent implements OnDestroy {
  slideShow: SlideShow;
  display = 'none';

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


    this.showSlideShowSub = this.slideShowService.showSlideShowSub
      .subscribe(
      (slideShow: SlideShow) => {
        this.slideShow = slideShow;
        this.display = 'block';
      });
  }


}