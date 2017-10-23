import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By }              from '@angular/platform-browser';
import { DebugElement }    from '@angular/core';

import { ReactiveFormsModule } from "@angular/forms";
import { PhotoInputComponent } from "./photo-input.component";
import { CommonModule } from '@angular/common';
import { SharedModule } from "../shared/shared.module";
import { photosRouting } from "./photos.routing";
import { PhotoListComponent } from "./photo-list.component";
import { PhotoComponent } from "./photo.component";
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { RouterModule } from "@angular/router";
import { HttpModule } from "@angular/http";
import { ActivatedRoute } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';


import { HomeComponent } from "../home.component";
import { HeaderComponent } from "../header.component";

import { appRouting } from "../app.routing";

import { TestService } from "../test.service";
import { UserTestService } from "../users/user-test.service";
import { PhotoTestService } from "./photo-test.service";



import { ChatService } from "../chat/chat.service";
import { UserService } from '../users/user.service';
import { ErrorService } from "../shared/errors/error.service";
import { SearchService } from "../shared/search/search.service";
import { PhotoService } from "../photos/photo.service";
import { TagService } from "../shared/tags/tag.service";
import { PersonService } from "../shared/people/person.service";
import { CommentsService } from "../shared/comments/comments.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { AuthUserService } from "../auth/auth-user.service";
import { AuthService } from "../auth/auth.service";
import { AppService } from "../app.service";
import { FileStackService } from "../shared/file-stack/file-stack.service";

// https://stackoverflow.com/questions/39582707/updating-input-html-field-from-within-an-angular-2-test
//https://semaphoreci.com/community/tutorials/testing-routes-in-angular-2

// let fixture;
// let componentInstance: PhotoInputComponent;
// let component: PhotoInputComponent;


/*
The createComponent method returns a ComponentFixture, a handle on the test environment surrounding the created component. 
The fixture provides access to the component instance itself and to the DebugElement, which is a handle on the component's DOM element.

The title property value is interpolated into the DOM within <h1> tags. Use the fixture's DebugElement to query for the <h1> element by CSS selector.

The query method takes a predicate function and searches the fixture's entire DOM tree for the first element that satisfies the predicate. The result is a different DebugElement, one associated with the matching DOM element.
*/
// xdescribe
xdescribe('PhotoInputComponent', () => {

  let component:    PhotoInputComponent;
  let fixture: ComponentFixture<PhotoInputComponent>;
  let compiled : any;
  let de:      DebugElement;
  let el:      HTMLElement;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PhotoInputComponent,
        PhotoListComponent,
        PhotoComponent,
        HeaderComponent,
        HomeComponent
      ],
      imports: [HttpModule, RouterModule, ReactiveFormsModule, CommonModule, SharedModule, photosRouting, appRouting, ToastModule.forRoot()],
      providers: [FileStackService, { provide: APP_BASE_HREF, useValue: '/src/app' }, CommentsService, PersonService, TagService, PhotoService, DialogService, AppService, AuthUserService, AuthService, ChatService, UserService, ErrorService, SearchService]
    });
  }));



  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoInputComponent);
    compiled = fixture.debugElement.nativeElement;
    component = fixture.debugElement.componentInstance
  });

  // beforeEach(async(() => {
  //   // The magic sauce!!
  //   // Because this is in an async wrapper it will automatically wait
  //   // for the call to whenStable() to complete
  //   //const userService = fixture.debugElement.injector.get(UserService);
  //   //const activatedRoute = fixture.debugElement.injector.get(ActivatedRoute);

  //   //const userServiceSpy = spyOn<UserService>(userService, 'getLoggedInUser').and.returnValue(UserTestService.getUsers()[0]);
  //   //spyOn<ActivatedRoute>(activatedRoute, 'snapshot').and.returnValue(PhotoTestService.getSnapshotForUrl('photo/add'));
  //   fixture.detectChanges();
  //   fixture.whenStable();
  // }));

  it('should create the PhotoInputComponent', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });


  it('should create a photo', () => {

    const userService = fixture.debugElement.injector.get(UserService);
    const activatedRoute = fixture.debugElement.injector.get(ActivatedRoute);

    const userServiceSpy = spyOn<UserService>(userService, 'getLoggedInUser').and.returnValue(UserTestService.getUsers()[0]);
    spyOn<ActivatedRoute>(activatedRoute, 'snapshot').and.returnValue(PhotoTestService.getSnapshotForUrl('photo/add'));

    let title = fixture.debugElement.query(By.css('#title'));
    console.log("should create a photo", 4);
    let description = fixture.debugElement.query(By.css('#description'));
    console.log("should create a photo", 5);
    //let title = photoInputComponentCompiled.querySelector('#title');
    //let description = photoInputComponentCompiled.querySelector('#description');
    // loginButton = fixture.debugElement.query(By.css('.btn-primary'));
    // formElement = fixture.debugElement.query(By.css('form'));


    TestService.sendInput(title.nativeElement, 'Title 1', fixture)
      .then(() => {
        return TestService.sendInput(description.nativeElement, 'Description 1', fixture)
      }).then(() => {
        //component.myForm.triggerEventHandler('submit', null);
        //photoService.f formElement.triggerEventHandler('submit', null);
        fixture.detectChanges();

        // let spinner = fixture.debugElement.query(By.css('img'));
        // expect(Helper.isHidden(spinner)).toBeFalsy('Spinner should be visible');

        // // ...etc...
      });

    //expect(photoInputComponent).toBeTruthy();

  });

});
