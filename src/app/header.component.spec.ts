import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement }    from '@angular/core';


import { RouterModule } from "@angular/router";
import { HttpModule } from "@angular/http";
import {APP_BASE_HREF} from '@angular/common';


import { HomeComponent } from "./home.component";
import { HeaderComponent } from "./header.component";

import { appRouting } from "./app.routing";

import { ChatService } from "./chat/chat.service";
import { UserService } from "./users/user.service";
import { ErrorService } from "./shared/errors/error.service";
import { SearchService } from "./shared/search/search.service";
import { PhotoService } from "./photos/photo.service";
import { TagService } from "./shared/tags/tag.service";
import { PersonService } from "./shared/people/person.service";
import { CommentsService } from "./shared/comments/comments.service";
import { DialogService } from "./shared/dialog/dialog.service";
import { AuthUserService } from "./auth/auth-user.service";
import { AuthService } from "./auth/auth.service";
import { AppService } from "./app.service";





describe('HeaderComponent', () => {


  let component:    HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let compiled : any;
  let de:      DebugElement;
  let el:      HTMLElement;
  let authUserService : AuthUserService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HeaderComponent,
        HomeComponent
      ], 
      imports: [RouterModule,HttpModule,appRouting],
      providers: [{provide: APP_BASE_HREF, useValue: '/src/app'},CommentsService, PersonService, TagService, PhotoService,DialogService,AppService,AuthUserService,AuthService,ChatService,UserService,ErrorService,SearchService]
    });
  }));
  

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.debugElement.componentInstance;
    compiled = fixture.debugElement.nativeElement;
    authUserService = fixture.debugElement.injector.get(AuthUserService);
  });

  it('should create the HeaderComponent', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render "Celebrate Mum And Dad" in navbar brand',() => {
    fixture.detectChanges();
    expect(compiled.querySelector('nav.navbar > a.navbar-brand').textContent).toContain('Celebrate Mum And Dad');
  });

  it('should ask you to Sign In if not signed in', () => {
    
    const spy = spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(false);
    fixture.detectChanges();
    expect(compiled.querySelector('nav.navbar > div.navbar-collapse > ul.ml-auto > li.nav-item > a.nav-link').textContent).toContain('Sign In');
  });

  it('should not ask you to Sign In if you are signed in', () => {
    spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(true);
    fixture.detectChanges();
    expect(compiled.querySelector('nav.navbar > div.navbar-collapse > ul.ml-auto > li.nav-item > a.nav-link').textContent).not.toContain('Sign In');
  });

  it('should not show photos menu option if you are not signed in', () => {
    spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(false);
    fixture.detectChanges();
    expect(compiled.querySelector('#photosNavItem')).toBeNull();
  });

  it('should show photos menu option if you are signed in', () => {
    spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(true);
    fixture.detectChanges();
    expect(compiled.querySelector('#photosNavItem')).toBeTruthy();
  });


  it('should not show memories menu option if you are not signed in', () => {
    spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(false);
    fixture.detectChanges();
    expect(compiled.querySelector('#memoriesNavItem')).toBeNull();
  });

  it('should show memories menu option if you are signed in', () => {
    spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(true);
    fixture.detectChanges();
    expect(compiled.querySelector('#memoriesNavItem')).toBeTruthy();
  });


  it('should not show users menu option if you are not signed in', () => {
    spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(false);
    fixture.detectChanges();
    expect(compiled.querySelector('#usersNavItem')).toBeNull();
  });


  it('should not show users menu option if you are signed in but not an admin user', () => {
    spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(true);
    spyOn<AuthUserService>(authUserService,'isAdminUser').and.returnValue(false);
    fixture.detectChanges();
    expect(compiled.querySelector('#usersNavItem')).toBeNull();
  });


  it('should show users menu option if you are signed in and an admin user', () => {
    spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(true);
    spyOn<AuthUserService>(authUserService,'isAdminUser').and.returnValue(true);
    fixture.detectChanges();
    expect(compiled.querySelector('#usersNavItem')).toBeTruthy();
  });

});
