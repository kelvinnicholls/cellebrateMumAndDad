import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header.component';
import { HomeComponent } from "./home.component";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { SharedModule } from "./shared/shared.module";
import { ChatModule } from "./chat/chat.module";
import { appRouting } from "./app.routing";

import { APP_BASE_HREF } from '@angular/common';

import { HttpModule } from "@angular/http";

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

// fdescribe
describe('AppComponent', () => {

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let compiled: any;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderComponent,
        HomeComponent
      ], imports: [RouterModule, ReactiveFormsModule, MultiselectDropdownModule, SharedModule, ChatModule, ToastModule.forRoot(), appRouting, HttpModule],
      providers: [{ provide: APP_BASE_HREF, useValue: '/src/app' }, CommentsService, PersonService, TagService, PhotoService, DialogService, AppService, AuthUserService, AuthService, ChatService, UserService, ErrorService, SearchService]
    });
  }));

  // You can count on the test runner to wait for the first asynchronous beforeEach to finish before calling the second.
  
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;
    compiled = fixture.debugElement.nativeElement;
  });


  //The TestBed.compileComponents method asynchronously compiles all the components configured in the testing module
  //WebPack developers need not call compileComponents because it inlines templates and css as part of the automated build process that precedes running the test.

  // fit
  it('should create the AppComponent', () => {

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
