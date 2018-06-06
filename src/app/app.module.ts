import { NgModule, APP_INITIALIZER } from '@angular/core';
import { Http } from "@angular/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { ToastOptions } from 'ng2-toastr';
import { AppComponent } from "./app.component";
//https://www.npmjs.com/package/ng2-toastr
import { ToastModule } from 'ng2-toastr/ng2-toastr';
// https://www.npmjs.com/package/angular2-password-strength-bar
// import { PasswordStrengthBar } from 'angular2-password-strength-bar';
//import { DatepickerModule } from 'ngx-bootstrap/datepicker'
// http://valor-software.com/ngx-bootstrap/#/datepicker

// https://github.com/danrevah/ngx-pipes#reverse-1
//import { NgPipesModule } from 'ngx-pipes';

import { HeaderComponent } from "./header.component";
import { appRouting } from "./app.routing";

import { SearchService } from "./shared/search/search.service";
import { SlideShowService } from "./shared/slideshow/slideshow.service";
import { ChatService } from "./chat/chat.service";
import { ErrorService } from "./shared/errors/error.service";
import { CommentsService } from "./shared/comments/comments.service";
import { DialogService } from "./shared/dialog/dialog.service";
import { ChatUsersComponent } from "./chat/chat-users/chat-users.component";
import { ChatMessagesListComponent } from "./chat/chat-messages-list/chat-messages-list.component";
import { ChatMessageComponent } from "./chat/chat-messages-list/chat-message/chat-message.component";
import { ChatSendMessageComponent } from "./chat/chat-send-message/chat-send-message.component";
import { AppService } from "./app.service";
import { HomeComponent } from "./home.component";
import { AuthService } from "./auth/auth.service";
import { AuthUserService } from "./auth/auth-user.service";
import { AuthGuard } from './auth/auth-guard.service';
import { ToastCustomOption } from './shared/toast/toast-custom-option';
import { SharedModule } from "./shared/shared.module";
import { ChatModule } from "./chat/chat.module";
import { UserService } from "./users/user.service";
import { PhotoService } from "./photos/photo.service";
import { ZipperService } from "./shared/zipper/zipper-service";
import { MemoryService } from "./memories/memory.service";
import { TagService } from "./shared/tags/tag.service";
import { PersonService } from "./shared/people/person.service";
import { FileStackService } from "./shared/file-stack/file-stack.service";

import * as moment from 'moment';
import { Consts } from "./shared/consts";
// import { Router } from "@angular/router";
// import { PhotoService2 } from "./photos/photo.service2";
// import { UserService2 } from "./users/user.service2";

//https://www.npmjs.com/package/angular2-tooltip
//import {ToolTipModule} from 'angular2-tooltip'
//https://ng-bootstrap.github.io/#/getting-started

// https://www.intertech.com/Blog/angular-4-tutorial-run-code-during-app-initialization/
// https://hackernoon.com/hook-into-angular-initialization-process-add41a6b7e


export function init_photo_service(photoService: PhotoService) {
    return () => photoService.initialize();
}

export function init_memory_service(memoryService: MemoryService) {
    return () => memoryService.initialize();
}

export function init_user_service(userService: UserService) {
    return () => userService.initialize();
}


export function init_tag_service(tagService: TagService) {
    return () => tagService.initialize();
}


export function init_person_service(personService: PersonService) {
    return () => personService.initialize();
}

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        HomeComponent
    ],
    imports: [
        BrowserAnimationsModule,
        appRouting,
        ReactiveFormsModule,
        HttpModule,
        ToastModule.forRoot(),
        //        NgPipesModule,
        ChatModule,
        SharedModule
    ],
    providers: [CommentsService
        , PersonService
        , TagService
        , AuthService
        , UserService
        , PhotoService
        , ZipperService
        , MemoryService
        , ErrorService
        , AuthGuard
        , { provide: ToastOptions, useClass: ToastCustomOption }
        , AppService
        , DialogService
        , ChatService
        , AuthUserService
        , SearchService
        , SlideShowService
        , FileStackService
        ,{ provide: APP_INITIALIZER, useFactory: init_photo_service, deps: [PhotoService], multi: true }
        ,{ provide: APP_INITIALIZER, useFactory: init_memory_service, deps: [MemoryService], multi: true }
        ,{ provide: APP_INITIALIZER, useFactory: init_user_service, deps: [UserService], multi: true }
        ,{ provide: APP_INITIALIZER, useFactory: init_tag_service, deps: [TagService], multi: true }
        ,{ provide: APP_INITIALIZER, useFactory: init_person_service, deps: [PersonService], multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

}