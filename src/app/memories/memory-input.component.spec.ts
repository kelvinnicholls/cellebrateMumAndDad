import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from "@angular/forms";
import { MemoryInputComponent } from "./memory-input.component";
import { CommonModule } from '@angular/common';
import { SharedModule } from "../shared/shared.module";
import { memoriesRouting } from "./memories.routing";
import { MemoryListComponent } from "./memory-list.component";
import { MemoryComponent } from "./memory.component";
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { RouterModule } from "@angular/router";
import { HttpModule } from "@angular/http";
import { ActivatedRoute } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

import { Observable } from "rxjs";

import { HomeComponent } from "../home.component";
import { HeaderComponent } from "../header.component";

import { appRouting } from "../app.routing";

import { TestService } from "../test.service";
import { UserTestService } from "../users/user-test.service";
import { MemoryTestService } from "./memory-test.service";



import { ChatService } from "../chat/chat.service";
import { UserService } from '../users/user.service';
import { PhotoService } from '../photos/photo.service';
import { ErrorService } from "../shared/errors/error.service";
import { SearchService } from "../shared/search/search.service";
import { MemoryService } from "../memories/memory.service";
import { TagService } from "../shared/tags/tag.service";
import { TagTestService } from "../shared/tags/tag-test.service";
import { PersonService } from "../shared/people/person.service";
import { PersonTestService } from "../shared/people/person-test.service";
import { CommentsService } from "../shared/comments/comments.service";
import { DialogService } from "../shared/dialog/dialog.service";
import { AuthUserService } from "../auth/auth-user.service";
import { AuthService } from "../auth/auth.service";
import { AppService } from "../app.service";
import { FileStackService } from "../shared/file-stack/file-stack.service";

// https://stackoverflow.com/questions/39582707/updating-input-html-field-from-within-an-angular-2-test
// https://semaphoreci.com/community/tutorials/testing-routes-in-angular-2

// let fixture;
// let componentInstance: MemoryInputComponent;
// let component: MemoryInputComponent;


/*
The createComponent method returns a ComponentFixture, a handle on the test environment surrounding the created component. 
The fixture provides access to the component instance itself and to the DebugElement, which is a handle on the component's DOM element.

The title property value is interpolated into the DOM within <h1> tags. Use the fixture's DebugElement to query for the <h1> element by CSS selector.

The query method takes a predicate function and searches the fixture's entire DOM tree for the first element that satisfies the predicate. The result is a different DebugElement, one associated with the matching DOM element.
*/
// xdescribe
// fdescribe
describe('MemoryInputComponent', () => {

  let component: MemoryInputComponent;
  let fixture: ComponentFixture<MemoryInputComponent>;
  let compiled: any;
  let de: DebugElement;
  let el: HTMLElement;
  let userService: UserService;
  let memoryService: MemoryService;
  let tagService: TagService;
  let personService: PersonService;

  let activatedRoute: ActivatedRoute;


  const titleVal = 'Title 1';
  const descriptionVal = 'Description 1';




  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MemoryInputComponent,
        MemoryListComponent,
        MemoryComponent,
        HeaderComponent,
        HomeComponent
      ],
      imports: [HttpModule, RouterModule, ReactiveFormsModule, CommonModule, SharedModule, memoriesRouting, appRouting, ToastModule.forRoot()],
      providers: [FileStackService, { provide: APP_BASE_HREF, useValue: '/src/app' }, CommentsService, PersonService, TagService, MemoryService, DialogService, AppService, AuthUserService, AuthService, ChatService, UserService, ErrorService, SearchService,PhotoService]
    });
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(MemoryInputComponent);
    compiled = fixture.debugElement.nativeElement;
    component = fixture.debugElement.componentInstance;
    userService = fixture.debugElement.injector.get(UserService);
    memoryService = fixture.debugElement.injector.get(MemoryService);
    tagService = fixture.debugElement.injector.get(TagService);
    personService = fixture.debugElement.injector.get(PersonService);
    activatedRoute = fixture.debugElement.injector.get(ActivatedRoute);
    activatedRoute.snapshot = MemoryTestService.getSnapShotForUrl('memory/add');
    spyOn<UserService>(userService, 'getLoggedInUser').and.returnValue(UserTestService.getUsers()[0]);
    spyOn<TagService>(tagService, 'getTags').and.returnValue(TestService.getObservable(TagTestService.getTags()));
    spyOn<PersonService>(personService, 'getPeople').and.returnValue(TestService.getObservable(PersonTestService.getPeople()));
    spyOn<MemoryInputComponent>(component, 'onSubmit').and.returnValue(null);
  });


  it('should create the MemoryInputComponent', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('form invalid when empty', () => {
    fixture.detectChanges();
    expect(component.myForm.valid).toBeFalsy();
  });


  it('title field initially invalid 1 ', () => {
    fixture.detectChanges();
    let title = component.myForm.controls['title'];
    expect(title.valid).toBeFalsy();
  });

  it('title field initially invalid 2', () => {
    fixture.detectChanges();
    let errors = {};
    let title = component.myForm.controls['title'];
    errors = title.errors || {};
    expect(errors['required']).toBeTruthy();
  });

  it('A valid title validates the title field', async(() => {
    spyOn<MemoryInputComponent>(component, 'forbiddenTitles').and.returnValue(Promise.resolve(null));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      let title = component.myForm.controls['title'];
      title.setValue(titleVal);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(title.valid).toBeTruthy();
      });
    });
  }));

  it('A duplicate title invalidates the title field', async(() => {
    spyOn<MemoryInputComponent>(component, 'forbiddenTitles').and.returnValue(Promise.resolve({ 'titleIsAlreadyUsed': true }));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      let title = component.myForm.controls['title'];
      title.setValue(titleVal);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(title.valid).toBeFalsy();
      });
    });
  }));

  it('A null title invalidates the title field', async(() => {
    spyOn<MemoryInputComponent>(component, 'forbiddenTitles').and.returnValue(Promise.resolve({ 'titleIsAlreadyUsed': true }));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      let title = component.myForm.controls['title'];
      title.setValue('');
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(title.valid).toBeFalsy();
      });
    });
  }));

  it('A valid description validates the description field', () => {
    fixture.detectChanges();
    let errors = {};
    let description = component.myForm.controls['description'];
    description.setValue(descriptionVal);
    fixture.detectChanges();
    //errors = description.errors || {};
    //expect(errors['pattern']).toBeTruthy(); 
    //expect(errors['required']).toBeFalsy(); 
    expect(description.valid).toBeTruthy();
  });

  it('A valid tags validates the tags field', () => {
    fixture.detectChanges();
    let errors = {};
    let tags = component.myForm.controls['tags'];
    tags.setValue(TagTestService.getTags());
    fixture.detectChanges();
    expect(tags.valid).toBeTruthy();
  });

  it('A valid people validates the people field', () => {
    fixture.detectChanges();
    let errors = {};
    let people = component.myForm.controls['people'];
    people.setValue(PersonTestService.getPeople());
    fixture.detectChanges();
    expect(people.valid).toBeTruthy();
  });

  it('A valid mediaDate validates the mediaDate field', () => {
    fixture.detectChanges();
    let errors = {};
    let mediaDate = component.myForm.controls['mediaDate'];
    mediaDate.setValue(TestService.getMediaDate(5));
    fixture.detectChanges();

    expect(mediaDate.valid).toBeTruthy();
  });


  it('Submit works with just required valid values', async(() => {
    spyOn<MemoryInputComponent>(component, 'forbiddenTitles').and.returnValue(Promise.resolve(null));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      let title = component.myForm.controls['title'];
      title.setValue(titleVal);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        component.onSubmit();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(component.myForm.pristine).toBeTruthy();
        });
      });
    });
  }));


  // fit('Submit fails with no required values', async(() => {
  //   spyOn<MemoryInputComponent>(component, 'forbiddenTitles').and.returnValue(Promise.resolve(null));
  //   fixture.detectChanges();
  //   fixture.whenStable().then(() => {
  //     expect(component.myForm.valid).toBeFalsy('Form Valid');
  //     component.onSubmit();
  //     fixture.detectChanges();
  //     fixture.whenStable().then(() => {
  //       expect(component.myForm.pristine).toBeFalsy('Form Pristine');
  //     });
  //   });
  // }));


  it('Submit works with all valid values', async(() => {
    spyOn<MemoryInputComponent>(component, 'forbiddenTitles').and.returnValue(Promise.resolve(null));
    fixture.detectChanges();
    fixture.whenStable().then(() => {

      let title = component.myForm.controls['title'];
      title.setValue(titleVal);
      let description = component.myForm.controls['description'];
      description.setValue(descriptionVal);
      let mediaDate = component.myForm.controls['mediaDate'];
      mediaDate.setValue(TestService.getMediaDate(5));
      let tags = component.myForm.controls['tags'];
      tags.setValue(TagTestService.getTags());
      let people = component.myForm.controls['people'];
      people.setValue(PersonTestService.getPeople());
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        component.onSubmit();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(component.myForm.pristine).toBeTruthy();
        });
      });
    });
  }));



});
