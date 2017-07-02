import { Directive, OnInit, Renderer, ElementRef, HostListener, HostBinding } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective implements OnInit {

  @HostBinding('class.open') classOpenEnable = false;

  @HostListener('click') toggleDropDown () {
    this.classOpenEnable = !this.classOpenEnable;
  }

  ngOnInit() {


  }

}
