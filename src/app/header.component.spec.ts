import { TestBed, async } from '@angular/core/testing';
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
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HeaderComponent,
        HomeComponent
      ], 
      imports: [RouterModule,HttpModule,appRouting],
      providers: [{provide: APP_BASE_HREF, useValue: '/src/app'},CommentsService, PersonService, TagService, PhotoService,DialogService,AppService,AuthUserService,AuthService,ChatService,UserService,ErrorService,SearchService]
    }).compileComponents();
  }));
  
  it('should create the HeaderComponent', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const headerComponent = fixture.debugElement.componentInstance;
    expect(headerComponent).toBeTruthy();
  });

  it('should render "Celebrate Mum And Dad" in navbar brand',() => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const compiled = fixture.debugElement.nativeElement;
    fixture.detectChanges();
    expect(compiled.querySelector('nav.navbar > a.navbar-brand').textContent).toContain('Celebrate Mum And Dad');
  });

  it('should ask you to Sign In if not signed in', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const compiled = fixture.debugElement.nativeElement;

    const authUserService : AuthUserService = fixture.debugElement.injector.get(AuthUserService);
    const spy = spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(false);
    fixture.detectChanges();
    expect(compiled.querySelector('nav.navbar > div.navbar-collapse > ul.ml-auto > li.nav-item > a.nav-link').textContent).toContain('Sign In');
  });

  it('should not ask you to Sign In if you are signed in', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    const compiled = fixture.debugElement.nativeElement;
    const authUserService : AuthUserService = fixture.debugElement.injector.get(AuthUserService);
    const spy = spyOn<AuthUserService>(authUserService,'isLoggedIn').and.returnValue(true);
    fixture.detectChanges();
    expect(compiled.querySelector('nav.navbar > div.navbar-collapse > ul.ml-auto > li.nav-item > a.nav-link').textContent).not.toContain('Sign In');
  });


});
