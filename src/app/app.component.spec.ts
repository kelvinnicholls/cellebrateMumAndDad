import { TestBed, async } from '@angular/core/testing';
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


describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderComponent,
        HomeComponent
      ], imports: [RouterModule, ReactiveFormsModule, MultiselectDropdownModule, SharedModule, ChatModule, ToastModule.forRoot(), appRouting, HttpModule],
      providers: [{ provide: APP_BASE_HREF, useValue: '/src/app' }, CommentsService, PersonService, TagService, PhotoService, DialogService, AppService, AuthUserService, AuthService, ChatService, UserService, ErrorService, SearchService]
    }).compileComponents();
  }));

  it('should create the AppComponent', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
