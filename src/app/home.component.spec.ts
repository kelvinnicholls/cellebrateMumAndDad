import { TestBed, async } from '@angular/core/testing';

import { HomeComponent } from "./home.component";

describe('HomeComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HomeComponent
      ]
    }).compileComponents();
  }));

  it('should create the HomeComponent', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const homeComponent = fixture.debugElement.componentInstance;
    expect(homeComponent).toBeTruthy();
  });

  it('should render welcome in a h1 tag', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('div.jumbotron > div.container > h1').textContent).toContain('Welcome to Celebrate Mum and Dad!');
  });
});
