import { NgModule } from '@angular/core';
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
import { NgPipesModule } from 'ngx-pipes';

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
import { MemoryService } from "./memories/memory.service";
import { TagService } from "./shared/tags/tag.service";
import { PersonService } from "./shared/people/person.service";
import { FileStackService } from "./shared/file-stack/file-stack.service";


//https://www.npmjs.com/package/angular2-tooltip
//import {ToolTipModule} from 'angular2-tooltip'
//https://ng-bootstrap.github.io/#/getting-started



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
        NgPipesModule,
        ChatModule,
        SharedModule
    ],
    providers: [CommentsService, PersonService, TagService, AuthService, UserService, PhotoService, MemoryService, ErrorService, AuthGuard, { provide: ToastOptions, useClass: ToastCustomOption }, AppService, DialogService, ChatService, AuthUserService, SearchService, SlideShowService, FileStackService],
    bootstrap: [AppComponent]
})
export class AppModule {

}