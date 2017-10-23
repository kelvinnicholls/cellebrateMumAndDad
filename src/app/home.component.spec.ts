import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement }    from '@angular/core';

import { HomeComponent } from "./home.component";

describe('HomeComponent', () => {

  let component:    HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let compiled : any;
  let de:      DebugElement;
  let el:      HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HomeComponent
      ]
    });
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.debugElement.componentInstance;
    compiled = fixture.debugElement.nativeElement;
  });

  it('should create the HomeComponent', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render welcome in a h1 tag', () => {
    fixture.detectChanges();
    expect(compiled.querySelector('div.jumbotron > div.container > h1').textContent).toContain('Welcome to Celebrate Mum and Dad!');
  });
});
